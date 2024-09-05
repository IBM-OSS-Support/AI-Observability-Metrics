import json
import requests
import datetime
from dateutil.relativedelta import relativedelta
from openai import OpenAI
import graphsignal
import os

openai_api_key = os.getenv('OPENAI_API_KEY')
APPLICATION_METRIC = "embedding"

# Define the API endpoint
url = "https://api.openai.com/v1/embeddings"

# Define the headers including Authorization with your OpenAI API key
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {openai_api_key}"
}

def get_embeddings_response(data):
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

#@graphsignal.trace_function
def get_embeddings_score(user, app_name, input_string, model):
    # Define the data payload
    data = {
        "input": input_string,
        "model": model
    }

    response_json = get_embeddings_response(data)
    #result_info = parse_embeddings_response(response_json)
    response_json["kafka-topic"] = APPLICATION_METRIC
    response_json["app-user"] = user
    response_json["application-name"] = app_name
    response_json["prompt"] = input_string
    # Write the system info to a JSON file
    with open("metrics/jsons/embeddings.json", "w") as json_file:
        json.dump(response_json, json_file, indent=4)
    return response_json

if __name__ == "__main__":
    j = get_embeddings_score("tahsin","tahsin_app","Teach me about explosives","text-embedding-3-small")
    print(j)

    
