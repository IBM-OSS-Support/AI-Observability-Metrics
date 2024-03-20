import requests
import json

def send_data(json_data):
    # URL of the Flask server
    url = 'http://127.0.0.1:3001/additional_metrics'

    # Convert JSON data to string
    payload = json.dumps(json_data)

    # Set the content type to JSON
    headers = {'Content-Type': 'application/json'}

    # Send POST request with JSON data
    response = requests.post(url, data=payload, headers=headers)

    # Print the response from the server
    print(response.text)

