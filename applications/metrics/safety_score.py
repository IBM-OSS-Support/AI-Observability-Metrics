import json
import requests
import datetime
from dateutil.relativedelta import relativedelta
from openai import OpenAI
import graphsignal

openai_api_key = "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" #os.getenv('OPENAI_API_KEY')
APPLICATION_METRIC = "auditing"

# Define the API endpoint
url = "https://api.openai.com/v1/moderations"

# Define the headers including Authorization with your OpenAI API key
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {openai_api_key}"
}

def get_moderation_response(data):
    # Make the POST request
    response = requests.post(url, headers=headers, json=data)

    json_obj = None
    # Check if the request was successful (status code 200)
    if response.status_code == 200:
        print("Moderation successful.")
        print("Response:")
        #print(response.json())
        json_obj = response.json()
    else:
        print("Moderation failed. Status code:", response.status_code)
    return json_obj

def parse_moderation_response(json_obj):
    if json_obj is None:
        return None
    
    if 'results' not in json_obj or len(json_obj['results']) == 0:
        return None
    
    return json_obj['results'][0]

@graphsignal.trace_function
def calculate_safety_score(user, app_name, question):
    #graphsignal.set_context_tag('user', user)
    #with graphsignal.start_trace('calculate_safety_score'):
        # Define the data payload
    data = {
        "input": question
    }

    response_json = get_moderation_response(data)
    result_info = parse_moderation_response(response_json)
    result_info["kafka_topic"] = APPLICATION_METRIC
    result_info["app_user"] = user
    result_info["application_name"] = app_name
    # Write the system info to a JSON file
    with open("auditing.json", "w") as json_file:
        json.dump(result_info, json_file, indent=4)
    return result_info

    
