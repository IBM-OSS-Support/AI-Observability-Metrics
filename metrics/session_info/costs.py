import json  # to work on request responses and storage data
import requests # call API
import datetime # parse dates
from dateutil.relativedelta import relativedelta # date manipulation
import dateutil.parser as dparser # parse dates from strings

import os # get environment vars
import pandas as pd # you probably wrote this one before I tell
import time # sleeper to avoid exceeding API limits

import requests
import datetime


openai_org_id = "org-zvKGqHl0adRlJbe7lpb7n1wX" #from james #"org-8BwheRTrv47l6MxkOrVnU7uG" #os.getenv('OPENAI_ORG_ID')
openai_api_key = "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" # from james #"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" #os.getenv('OPENAI_API_KEY')

# API headers
headers = {'Authorization': f'Bearer {openai_api_key}'}

# API endpoint
url = 'https://api.openai.com/v1/usage'

# Date for which to get usage data
date = datetime.date(2023, 3, 5)

# Parameters for API request
params = {'date': date.strftime('%Y-%m-%d')}

# Send API request and get response
response = requests.get(url, headers=headers, params=params)
usage_data = response.json()['data']

# Calculate total number of tokens used for each model
total_tokens_used_davinci = 0
total_tokens_used_ada = 0

for data in usage_data:
    model_name = data['model']
    n_generated_tokens_total = data['n_generated_tokens_total']
    n_context_tokens_total = data['n_context_tokens_total']
    total_tokens = n_generated_tokens_total + n_context_tokens_total
    if model_name == 'text-davinci-003':
        total_tokens_used_davinci += total_tokens
    elif model_name == 'text-embedding-ada-002':
        total_tokens_used_ada += total_tokens

# Estimate cost for each model based on token usage
davinci_cost_per_token = 0.002 / 1000
ada_cost_per_token = 0.0004 / 1000

total_cost_davinci = total_tokens_used_davinci * davinci_cost_per_token
total_cost_ada = total_tokens_used_ada * ada_cost_per_token

# Print estimated costs
print(f"Total number of tokens used by text-davinci-003 on {date}: {total_tokens_used_davinci}")
print(f"Estimated cost for text-davinci-003 on {date}: ${total_cost_davinci:.2f}")

print(f"\nTotal number of tokens used by text-embedding-ada-002 on {date}: {total_tokens_used_ada}")
print(f"Estimated cost for text-embedding-ada-002 on {date}: ${total_cost_ada:.2f}")
