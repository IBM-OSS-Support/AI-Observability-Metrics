import json  # to work on request responses and storage data
import requests # call API
import datetime # parse dates
from dateutil.relativedelta import relativedelta # date manipulation
import dateutil.parser as dparser # parse dates from strings

import os # get environment vars
import pandas as pd # you probably wrote this one before I tell
import time # sleeper to avoid exceeding API limits

openai_org_id = "org-zvKGqHl0adRlJbe7lpb7n1wX" #from james #"org-8BwheRTrv47l6MxkOrVnU7uG" #os.getenv('OPENAI_ORG_ID')
openai_api_key = "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" # from james #"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" #os.getenv('OPENAI_API_KEY')
APPLICATION_METRIC = "session_info"

files = []
[files.append(f) for f in os.listdir() if f.endswith('.json')]
files.sort()

#first_day = datetime.datetime(2024, 3, 1)
#first_day += relativedelta(days=1) # adding 1 day to start from the day after last extraction

first_day = datetime.datetime.now()
first_day = first_day.replace(hour=0, minute=0)
#first_day = datetime.datetime.combine(today, datetime.time(0, 1))

print(first_day)
current_day = datetime.datetime.now()#datetime.date.today() #end date

headers = {
    "method": "GET",
    "authority": "api.openai.com",
    "scheme": "https",
    "path": f"/v1/organizations/{openai_org_id}/users",
    "authorization": f"Bearer {openai_api_key}",
}

starttime = time.monotonic() #starting to count time because the following request counts for the usage limits

users_response = requests.get(f"https://api.openai.com/v1/organizations/{openai_org_id}/users", headers=headers)
users = users_response.json()["members"]["data"]
idate = datetime.date(2023, 3, 1)
df_costs = pd.DataFrame() #empty dataframe to store the data extracted

for user in users:
    
    id_of_user = user["user"]["id"]

    current_date = first_day
    
    while current_date <= current_day and True:
        
        # I was giving 15 seconds just to ensure the requests per minute would not break the limits
        time.sleep(15.0 - ((time.monotonic() - starttime) % 15.0))
        
        usage_headers = {
            "method": "GET",
            "authority": "api.openai.com",
            "authorization": f"Bearer {openai_api_key}",
            "openai-organization": openai_org_id,
        }
        
        current_date_formatted = current_date.strftime('%Y-%m-%d')
        usage_response = requests.get(f"https://api.openai.com/v1/usage?date={current_date_formatted}&user_public_id={id_of_user}", headers=usage_headers)
        user_data = usage_response.json()
     
        print(user_data)
        # This conditional is to avoid breaking if the response is empty
        if len(user_data['data'])==0:
            
            current_date += relativedelta(days=1)
            
            continue
            
        else:
            
            data = user_data["data"]
            
            # This condition is to parse whisper model response in the same structure as the GPT/Embeddings models
            if len(user_data['whisper_api_data'])>0:
                
                wad = []
                for w in user_data['whisper_api_data']:
                    wd={}
                    wd['aggregation_timestamp'] = w['timestamp']
                    wd['n_requests'] = w['num_requests']
                    wd['operation'] = 'audio-whisper'
                    wd['snapshot_id'] = w['model_id']
                    wd['n_context'] = w['num_seconds']
                    wd['n_context_tokens_total'] = w['num_seconds']
                    wd['n_generated'] = 0
                    wd['n_generated_tokens_total'] = 0
                    wad = wad + [wd]
                data = data + wad
                
            else:
                
                pass
              
            df = pd.DataFrame(data)
            df['local_timestamp'] = df['aggregation_timestamp'].apply(lambda x: datetime.datetime.fromtimestamp(x))
            df['query_date'] = current_date_formatted
            # converting to openai tz
            #df['system_timestamp'] = df['local_timestamp'].dt.tz_localize('America/Sao_Paulo').dt.tz_convert("UTC")
            df['user'] = user["user"]["name"].lower().replace(" ", "_")
            df['email'] = user["user"]["email"]

            df_costs = pd.concat([df_costs,df])

            current_date += relativedelta(days=1)

model_costs = {
    "gpt-3.5-turbo": {"context": 0.0015, "generated": 0.002},
    "gpt-3.5-turbo-0301": {"context": 0.0015, "generated": 0.002},
    "gpt-3.5-turbo-0613": {"context": 0.0015, "generated": 0.002},
    "gpt-3.5-turbo-16k": {"context": 0.003, "generated": 0.004},
    "gpt-3.5-turbo-16k-0613": {"context": 0.003, "generated": 0.004},
    "gpt-4": {"context": 0.03, "generated": 0.06},
    "gpt-4-0314": {"context": 0.03, "generated": 0.06},
    "gpt-4-0613": {"context": 0.03, "generated": 0.06},
    "gpt-4-32k": {"context": 0.06, "generated": 0.12},
    "gpt-4-32k-0314": {"context": 0.06, "generated": 0.12},
    "gpt-4-32k-0613": {"context": 0.06, "generated": 0.12},
    "text-embedding-ada-002-v2": {"context": 0.0001, "generated": 0},
    "text-davinci:003": {"context": 0.02, "generated": 0.02},
    "whisper-1": {"context": 0.1, "generated": 0}, # costs are 0.006 per min (or 0.0001 per second). Multiplying by x1000 to use same rules as tokens
}

mc = pd.DataFrame(model_costs)
mc = mc.T.reset_index()

df_costs=df_costs.merge(mc, left_on='snapshot_id', right_on='index', how='left')
df_costs['context_costs']=(df_costs['n_context_tokens_total']/1)*df_costs['context']
df_costs['generated_costs']=(df_costs['n_generated_tokens_total']/1)*df_costs['generated']
df_costs['total_costs']=df_costs['context_costs']+df_costs['generated_costs']

df_costs.reset_index(drop='level_0', inplace=True)

# ensuring datetime formats
df_costs['local_timestamp'] = pd.to_datetime(df_costs['local_timestamp'])
df_costs

df_costs['local_timestamp'] = df_costs['local_timestamp'].apply(lambda a: datetime.datetime.strftime(a,"%Y-%m-%d %H:%M:%S"))

sessions = df_costs.to_dict(orient='records')
json_object = {
    "kafka_topic": APPLICATION_METRIC,
    "sessions": sessions
}

with open(f"openai_costs.json", "w") as f:
    json.dump(json_object, f, indent=4)


df_costs.to_excel("openai_costs.xlsx", index=True)  # This will save the DataFrame without the index
