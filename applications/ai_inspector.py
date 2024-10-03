import logging
import os
import graphsignal
from dotenv import load_dotenv, find_dotenv
import uuid
import json

# auditing
import requests

# log app
import openai

logging.basicConfig()
logger = logging.getLogger()
logger.setLevel(logging.CRITICAL)
load_dotenv(find_dotenv())

# Load environment variables
API_URL = os.getenv('API_URL')
GRAPHSIGNAL_API_KEY = os.getenv('GRAPHSIGNAL_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')

def inject_instrumentation(app_data):
    print(API_URL,GRAPHSIGNAL_API_KEY,app_data["app-id"])
    graphsignal.configure(api_url=API_URL,api_key=GRAPHSIGNAL_API_KEY, deployment=app_data["app-id"]) # to send to IBM ROJA server
    graphsignal.set_context_tag('user', app_data["user"])
    pass

def generate_unique_id(app_user, app_name, length=16):
    random_uuid = str(uuid.uuid4()).replace('-', '')[:length]  # Remove hyphens and slice to the desired length
    unique_id = f"{app_user}_{app_name}_{random_uuid}"
    return unique_id

def gather_metrics(app_data, question=None, status="unknown"):
    json_obj = []
    
    # Safely access keys using .get() to handle missing keys
    user = app_data.get("user", None)
    app_id = app_data.get("app-id", None)
    
    json_obj.append(calculate_safety_score(user, app_id, question))
    json_obj.append(log_prompt_info(user, app_id, question, status))
    
    return json_obj

def gather_user_feedback(app_data, question=None):
    json_obj = []
    
    # Safely access keys using .get() to handle missing keys
    user = app_data.get("user", None)
    app_id = app_data.get("app-id", None)
    rating = app_data.get("rating", -1)
    comment = app_data.get("comment", None)
    accuracy = app_data.get("accuracy", -1)

    json_obj.append(prepare_user_satisfaction(user, app_id, question, rating, comment))
    json_obj.append(prepare_accuracy(user, app_id, accuracy))
    
    return json_obj

##### AUDITING
def get_moderation_response(data, url):
    # Make the POST request
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_API_KEY}"
    }
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

def calculate_safety_score(user, app_name, question):
    # Define the data payload
    result_info = {}
    if question is not None:
        data = {
            "input": question
        }
        response_json = get_moderation_response(data, "https://api.openai.com/v1/moderations")
        result_info = parse_moderation_response(response_json)
    result_info["kafka-topic"] = "auditing"
    result_info["app-user"] = user
    result_info["application-name"] = app_name

    if question is None:
        result_info["flagged"] = False
    return result_info

## LOGGING
def log_prompt_info(user, application_name, question, status):
    client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    '''
    chat_completion = client.chat.completions.create(
            messages=[{
                "role": "user",
                "content": question,
            }],
            model="gpt-3.5-turbo",
    )
    '''

        # Extract attributes for serialization
    chat_completion_dict = {
            "kafka-topic": "log_history",
            "status":status,
            "app-user":user,
            "application-name":application_name,
            "prompt":question,
    }
    return chat_completion_dict

#### USER SATISFACTION
def prepare_user_satisfaction(user, app_name, question, rating, comment):

    result_info = {
        "kafka-topic" : "user_satisfaction",
        "rating" : rating,
        "comment" : comment,
        "app-user" : user,
        "application-name" : app_name,
    }
    return result_info

##### ACCURACY
def prepare_accuracy(user, app_name, accuracy):

    result_info = {
        "kafka-topic" : "accuracy",
        "accuracy" : accuracy,
        "app-user" : user,
        "application-name" : app_name,
    }
    # Write the system info to a JSON file
    return result_info

#### SEND DATA TO FLASK ENDPOINTS
def send_data(json_data):
    # URL of the Flask server
    flask_server_url = os.getenv('FLASK_SERVER_URL')
    url = flask_server_url + '/additional_metrics'

    # Convert JSON data to string
    payload = json.dumps(json_data)

    # Set the content type to JSON
    headers = {'Content-Type': 'application/json'}

    # Send POST request with JSON data
    response = requests.post(url, data=payload, headers=headers)

    # Print the response from the server
    print(response.text)