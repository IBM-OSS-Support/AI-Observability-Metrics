import json
import base64
import requests

OPENAI_API_KEY = "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"

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
    print("calling calculate_safety_score")
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


# Open and read the JSON file
with open('spans.json', 'r') as file:
    data = json.load(file)  # Parse the JSON data into a Python dictionary

# Now `data` is a Python dictionary (the JSON object)
first_span = data[0]
if "payloads" in first_span:
    print("inside payloads")
    for payload in first_span["payloads"]:
        print("inside first_span")
        if "name" in payload and payload["name"] == "input":
            print("tahsin inside input")
            input = json.dumps(payload.get("content_base64", None))
            decoded_bytes = base64.b64decode(input)
            decoded_str = decoded_bytes.decode('utf-8')
            auditing_json = calculate_safety_score("user","app_name",decoded_str)

print(auditing_json)
