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

app = Flask(__name__)

 # Database credentials
dbname = "roja_postgres"
user = "postgres"
password = "postgres"
host = "roja-metric-backend-db"
port: '5432'

# Set up basic logging
logging.basicConfig(level=logging.DEBUG)

@app.route('/signals', methods=['POST'])
def upload():
    try:
        logging.debug("Received request")

        # Get the gzipped data from the request body
        gzipped_protobuf_data = request.data
        # logging.debug(f"Raw gzipped data received: {gzipped_protobuf_data}")

        # Decompress the gzipped data
        protobuf_data = gzip.decompress(gzipped_protobuf_data)
        # logging.debug(f"Decompressed Protobuf data: {protobuf_data}")

        # Parse the Protobuf data
        signal = UploadRequest()
        signal.ParseFromString(protobuf_data)
        logging.debug("Parsed Protobuf data")

        # Right after parsing the Protobuf data
        # logging.debug(f"Protobuf message: {signal}")

        # Convert the Protobuf message to a Python dictionary
        signal_dict = MessageToDict(signal, preserving_proto_field_name=True)
        logging.debug("Converted Protobuf to dictionary")

        # Convert the Python dictionary to JSON
        json_data = json.dumps(signal_dict, indent=4)  # Add indentation for readability
        logging.debug("Converted dictionary to JSON")

        # print(json_data)  # Print the JSON data

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
            data JSONB NOT NULL
        )
        """
        cursor.execute(create_table_sql)

        # SQL command to insert the JSON data
        insert_sql = "INSERT INTO signals (data) VALUES (%s)"
        cursor.execute(insert_sql, (json_data,))

        conn.commit()
        cursor.close()
        conn.close()

        logging.debug("JSON data written to PostgreSQL")

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
        fetch_sql = "SELECT data FROM signals ORDER BY id DESC LIMIT 1"
        cursor.execute(fetch_sql)

        # Fetch the most recent row from the database
        logging.debug("Fetching data from the database...")
        row = cursor.fetchone()
        result = dict(row) if row else {}

        # Logging the fetched row for debugging
        logging.debug("Fetched row: %s", row)

        # Close the cursor and connection
        cursor.close()
        conn.close()

        # Return the fetched data as JSON
        return jsonify(result)

    except Exception as e:
        # Log the error
        logging.error("Error occurred: %s", e)
        return jsonify({"error": "Unable to fetch data from the database"}), 500

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
