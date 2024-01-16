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
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from psycopg2.extras import Json
import subprocess
import time
from io import BytesIO
import datetime

app = Flask(__name__)

 # Database credentials
dbname = "roja_postgres"
user = "postgres"
password = "postgres"
host = "9.30.147.134"
port: '5432'

# Set up basic logging
logging.basicConfig(level=logging.DEBUG)

@app.route('/signals', methods=['POST'])
def upload():
    try:
        logging.debug("Received request")

        # Get the gzipped data from the request body
        gzipped_protobuf_data = request.data
        
        content = _gunzip_data(gzipped_protobuf_data)
        
        signal = signals_pb2.UploadRequest()
        signal.ParseFromString(content)
                
        # Convert the Protobuf message to a Python dictionary
        signal_dict = MessageToDict(signal, preserving_proto_field_name=True)

        tag = 'none'
        # Check for the presence of 'metrics' or 'span' keys inside 'data'
        if 'metrics' in signal_dict:
            tag = 'metrics'
        elif 'span' in signal_dict:
            tag = 'span'
            
        def extract_application_name(data_obj):
            if isinstance(data_obj, list):
                for item in data_obj:
                    if 'tags' in item and isinstance(item['tags'], list):
                        for tag in item['tags']:
                            if tag.get('key') == 'deployment':
                                return tag.get('value')
            return None

        # Extract application name from the JSON
        signal_dict['application-name'] = extract_application_name(signal_dict[tag])

        logging.debug(signal_dict['upload_ms'])
        logging.debug(signal_dict['application-name'])

        # Convert the Python dictionary to JSON
        json_data = json.dumps(signal_dict, indent=4)  # Add indentation for readability

        file_name = f"response.json"
        file_path = os.path.join("/tmp/test", file_name)

        if os.path.isfile(file_path):
            os.remove(file_path)

        # Save the received gzip data to a file on your system
        with open(file_path, 'w') as file:
            file.write(json_data)

        # Connect to the database
        conn = psycopg2.connect(dbname=dbname, user=user, password=password, host=host)
        cursor = conn.cursor()

        # Create a table if it does not exist
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS signals (
            id SERIAL PRIMARY KEY,
            data JSONB,
            application_name TEXT,
            timestamp TIMESTAMP,
            CONSTRAINT unique_tag_application_name UNIQUE (application_name)
        )
        """
        cursor.execute(create_table_sql)
        
        # Get the current timestamp
        current_timestamp = datetime.datetime.now()

        # SQL command to insert the JSON data along with 'application-name', 'tag', and timestamp
        insert_metric_sql = "INSERT INTO signals (data, application_name, timestamp) VALUES (%s, %s, %s) ON CONFLICT ON CONSTRAINT unique_tag_application_name DO UPDATE SET data = %s, timestamp = %s"

        cursor.execute(insert_metric_sql, (json_data, signal_dict.get('application-name', None), current_timestamp, json_data, current_timestamp))

        conn.commit()
        cursor.close()
        conn.close()

        logging.debug("JSON metric, span, 'application-name', and timestamp written to PostgreSQL")

        logging.debug("Processed request successfully")

        # You can now use the parsed JSON data as needed
        return 'Signal received successfully'

    except Exception as e:
        logging.error(f'Error processing request: {str(e)}')
        return f'Error: {str(e)}', 500
    
    
# Route to get data from PostgreSQL and send it to UI
@app.route('/roja-metrics', methods=['GET'])
def get_latest_data():
    try:
        # Connect to the database
        logging.debug("Attempting database connection...")
        conn = psycopg2.connect(dbname=dbname, user=user, password=password, host=host)
        cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

        # SQL command to fetch the most recent data
        fetch_sql = "SELECT * FROM signals"
        cursor.execute(fetch_sql)

        # Fetch the most recent row from the database
        logging.debug("Fetching data from the database...")
        rows = cursor.fetchall()
        results = [dict(row) for row in rows] if rows else []

        # Logging the fetched rows for debugging
        logging.debug("Fetched rows: %s", results)

        # Close the cursor and connection
        cursor.close()
        conn.close()

        # Return the fetched data as JSON
        return jsonify(results)

    except Exception as e:
        # Log the error
        logging.error("Error occurred: %s", e)
        return jsonify({"error": "Unable to fetch data from the database"}), 500

def _gunzip_data(data):
    return gzip.GzipFile('', 'r', 0, BytesIO(data)).read()

@app.route('/run-roja-script', methods=['POST'])
def run_script():
    try:
        # Execute the sample.py script
        result = subprocess.run(['python', 'sample.py'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

        # Check if the script ran successfully
        if result.returncode == 0:
            return jsonify({"message": "Script executed successfully", "output": result.stdout})
        else:
            return jsonify({"error": "Script execution failed", "output": result.stderr}), 500

    except Exception as e:
        # In case of any exception, return a failure message
        print(e)
        return jsonify({"error": "An error occurred while executing the script"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001)
