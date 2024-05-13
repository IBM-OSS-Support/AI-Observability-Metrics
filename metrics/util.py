import requests
import json

# URL for the Flask endpoint
url = 'http://localhost:5000/receive_json'

def send_json(json_data):
    # Send POST request with JSON object
    response = requests.post(url, json=json_data)

    # Check if the request was successful
    if response.status_code == 200:
        print("POST request successful. Response:", response.json())
    else:
        print("POST request failed. Status code:", response.status_code)