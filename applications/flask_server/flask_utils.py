import requests
import json
import os

flask_server_url = os.getenv('FLASK_SERVER_URL')

def send_data(json_data):
    # URL of the Flask server
    url = flask_server_url + '/additional_metrics'

    # Convert JSON data to string
    payload = json.dumps(json_data)

    # Set the content type to JSON
    headers = {'Content-Type': 'application/json'}

    # Send POST request with JSON data
    response = requests.post(url, data=payload, headers=headers)

    # Print the response from the server
    print(response.text)

def send_anthropic_data(json_data):
    # URL of the Flask server
    url = flask_server_url + '/anthropic_metrics'

    # Convert JSON data to string
    payload = json.dumps(json_data)

    # Set the content type to JSON
    headers = {'Content-Type': 'application/json'}

    # Send POST request with JSON data
    response = requests.post(url, data=payload, headers=headers)

    # Print the response from the server
    print(response.text)