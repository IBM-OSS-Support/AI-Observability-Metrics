from flask import Flask, request, send_file, make_response, jsonify
import os
import gzip
import random
import shutil
import requests
import json
from google.protobuf import message
import graphsignal
from graphsignal.proto import signals_pb2
from graphsignal.proto.signals_pb2 import UploadRequest
from google.protobuf.json_format import MessageToDict
import logging
# import psycopg2
# from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

app = Flask(__name__)

# Set up basic logging
logging.basicConfig(level=logging.DEBUG)

@app.route('/signals', methods=['POST'])
def upload():
    try:
        logging.debug("Received request")

        # Get the gzipped data from the request body
        gzipped_protobuf_data = request.data
        logging.debug(f"Raw gzipped data received: {gzipped_protobuf_data}")

        # Decompress the gzipped data
        protobuf_data = gzip.decompress(gzipped_protobuf_data)
        logging.debug(f"Decompressed Protobuf data: {protobuf_data}")

        # Parse the Protobuf data
        signal = UploadRequest()
        signal.ParseFromString(protobuf_data)
        logging.debug("Parsed Protobuf data")

        # Right after parsing the Protobuf data
        logging.debug(f"Protobuf message: {signal}")

        # Convert the Protobuf message to a Python dictionary
        signal_dict = MessageToDict(signal, preserving_proto_field_name=True)
        logging.debug("Converted Protobuf to dictionary")

        # Convert the Python dictionary to JSON
        json_data = json.dumps(signal_dict, indent=4)  # Add indentation for readability
        logging.debug("Converted dictionary to JSON")

        print(json_data)  # Print the JSON data

        file_name = f"response.json"
        file_path = os.path.join("/tmp/test", file_name)

        if os.path.isfile(file_path):
            os.remove(file_path)

        # Save the received gzip data to a file on your system
        with open(file_path, 'w') as file:
            file.write(json_data)
        
        # # Database credentials
        # dbname = "your_dbname"
        # user = "your_username"
        # password = "your_password"
        # host = "your_host"

        # # Connect to the default database (like 'postgres')
        # conn = psycopg2.connect(dbname="postgres", user=user, password=password, host=host)
        # conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        # cursor = conn.cursor()

        # # Create a new database if it does not exist
        # cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{dbname}'")
        # if cursor.fetchone() is None:
        #     cursor.execute(f"CREATE DATABASE {dbname}")
        
        # cursor.close()
        # conn.close()

        # # Connect to the new database
        # conn = psycopg2.connect(dbname=dbname, user=user, password=password, host=host)
        # cursor = conn.cursor()

        # # Create a table if it does not exist
        # create_table_sql = """
        # CREATE TABLE IF NOT EXISTS signals (
        #     id SERIAL PRIMARY KEY,
        #     data JSONB NOT NULL
        # )
        # """
        # cursor.execute(create_table_sql)

        # # SQL command to insert the JSON data
        # insert_sql = "INSERT INTO signals (data) VALUES (%s)"
        # cursor.execute(insert_sql, (json_data,))

        # conn.commit()
        # cursor.close()
        # conn.close()

        # logging.debug("JSON data written to PostgreSQL")

        logging.debug("Processed request successfully")

        # You can now use the parsed JSON data as needed
        return 'Signal received successfully'

    except Exception as e:
        logging.error(f'Error processing request: {str(e)}')
        return f'Error: {str(e)}', 500
    
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
    app.run(host='0.0.0.0', port=6000)
