from flask import Flask, request, send_file, make_response, jsonify
import os
import gzip
import random
import shutil
import requests

app = Flask(__name__)

@app.route('/signals', methods=['POST'])
def upload():
    try:
        # Get the gzip data from the request body
        gzip_data = request.data
        print(gzip_data)
        # Generate a unique file name
        id = random.randint(0, 10)
        file_name = f"response.gzip"
        file_path = os.path.join("/tmp/test", file_name)

        if os.path.isfile(file_path):
            os.remove(file_path)

        # Save the received gzip data to a file on your system
        with open(file_path, 'wb') as file:
            file.write(gzip_data)

        # Decompress the saved gzip file
        output_file_path = os.path.splitext(file_path)[0]  # Remove .gzip extension
        if os.path.isfile(output_file_path):
            os.remove(output_file_path)

        with gzip.open(file_path, 'rb') as gzipped_file, open(output_file_path, 'wb') as output_file:
            shutil.copyfileobj(gzipped_file, output_file)

        # Create a Flask JSON response
        response_data = {
            "uploadMs": "1702017204072",
        }
        response = make_response(jsonify(response_data))

        return response

    except Exception as e:
        return str(e)
    
def loginData():
    url = "https://app.graphsignal.com/user/login"
    
    headers = {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "content-type": "application/json",
    }

    data = {
        "email": "abdulla.thanseeh@ibm.com",
        "password": "Abdullaibm01997$",
        "token": None
    }

    response = requests.post(url, headers=headers, json=data, cookies=request.cookies)
    data = response.json()
    user = data.get("user")
    token = user.get("token")
    return token
    
@app.route('/user/build_dashboard/', methods=['POST'])
def build_dashboard():
    url = "https://app.graphsignal.com/user/build_dashboard"

    dashboard_name = request.json.get("dashboard_name")
    view = request.json.get("view")

    token = loginData()

    print(token)
    
    headers = {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "authorization": "Bearer "+ token,
        "content-type": "application/json",
        "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin"
    }

    payload = {
        "dashboard_name": dashboard_name,
        "passed_params": {
            "range_end": 1704976624,
            "range_start": 1704371824,
            "range_type": "last7d",
            "tag_component": "*",
            "tag_deployment": "*",
            "tag_hostname": "*",
            "tag_operation": "*",
            "tag_user": "*",
            "view": view
        },
        "cached_params": {},
        "no_cache": False
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()  # Raise an exception if the response status code is not 2xx

        # Handle the response as needed
        response_json = response.json()
        return jsonify(response_json), 200
    except requests.exceptions.RequestException as e:
        # Handle exceptions (e.g., connection error)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
