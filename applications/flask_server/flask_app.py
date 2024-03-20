import sys
from flask import Flask, request, make_response, jsonify
import os
import json
from graphsignal.proto import signals_pb2
from google.protobuf.json_format import MessageToDict
import logging
import psycopg2
import datetime
from flask_cors import CORS
from dotenv import load_dotenv
from utils import _gunzip_data, calculate_openai_cost


#/root/roja-project/roja-metric-poc/applications/kafka_roja
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from kafka_roja import producer

load_dotenv()

app = Flask(__name__)
CORS(app)

# Set up basic logginglogging.basicConfig(level=logging.DEBUG)
logging.basicConfig(level=logging.CRITICAL)


def create_db_connection():
    try:
        # Get database connection parameters from environment variables
        
        DB_NAME="roja_postgres"
# DB_NAME=roja_dev # dev 
        DB_USER="roja_user"
        DB_PASSWORD="roja_user"
        DB_HOST="9.20.196.69"
        DB_PORT=5432
        #DB_NAME = os.environ.get("DB_NAME")
        #DB_USER = os.environ.get("DB_USER")
        #DB_PASSWORD = os.environ.get("DB_PASSWORD")
        #DB_HOST = os.environ.get("DB_HOST")
        print(DB_NAME, DB_USER, DB_PASSWORD, DB_HOST)
        # Establish the database connection
        connection = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST
        )

        return connection

    except psycopg2.Error as e:
        print("Error connecting to the database:", e)
        return None

@app.route('/additional_metrics', methods=['POST'])
def upload_additional():
    try:
        print("tahsin in /addtional_signals")
        logging.debug("Received request: /additional_metrics")
        data = request.get_json()
        producer.kafka_producer(data)
        jsonify({"message": "JSON received successfully"}), 200
    except Exception as e:
        logging.error(f'Error processing request: {str(e)}')
        return f'Error: {str(e)}', 500

@app.route('/signals', methods=['POST'])
def upload():
    try:
        print("tahsin in /signals")
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
        elif 'spans' in signal_dict:
            print("tahsin got span")
            tag = 'spans'

            
        def extract_application_name(data_obj):
            if isinstance(data_obj, list):
                for item in data_obj:
                    if 'tags' in item and isinstance(item['tags'], list):
                        for tag in item['tags']:
                            if tag.get('key') == 'deployment':
                                return tag.get('value')
            return None

        # Extract application name from the JSON
        print("tahsin before app")
        signal_dict['application-name'] = "bhoomiah"#extract_application_name(signal_dict[tag])
        signal_dict['kafka_topic'] = tag

        print("tahsin after")
        # Extract token count and calculate cost
        token_count = sum(int(metric.get('counter', 0)) for metric in signal_dict.get('metrics', []) if metric['name'] == 'token_count')

        print("tahsin after 1")
        signal_dict['token-cost'] = calculate_openai_cost(token_count)

        logging.debug(signal_dict['token-cost'])
        logging.debug(signal_dict['upload_ms'])
        logging.debug(signal_dict['application-name'])

        # Convert the Python dictionary to JSON
        json_data = json.dumps(signal_dict, indent=4)  # Add indentation for readability

        file_name = f"response.json"
        file_path = os.path.join("/tmp/", file_name)

        if os.path.isfile(file_path):
            #os.remove(file_path)
            file_name = f"response1.json"
            file_path = os.path.join("/tmp/", file_name)

        # Save the received gzip data to a file on your system
        with open(file_path, 'w') as file:
            file.write(json_data)
        #json_obj = json.loads(json_data)
        #json_obj['kafka-topic'] = tag
        #producer.kafka_producer(json_obj)
        
        # Connect to the database
        conn = create_db_connection()
        cursor = conn.cursor()

        # Create a table if it does not exist
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS signals_ (
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
        insert_metric_sql = "INSERT INTO signals_ (data, application_name, timestamp) VALUES (%s, %s, %s) ON CONFLICT ON CONSTRAINT unique_tag_application_name DO UPDATE SET data = %s, timestamp = %s"

        cursor.execute(insert_metric_sql, (json_data, signal_dict.get('application-name', None), current_timestamp, json_data, current_timestamp))

        conn.commit()
        cursor.close()
        conn.close()

        logging.debug("JSON metric, span, 'application-name', and timestamp written to PostgreSQL")

        logging.debug("Processed request successfully")
        # Create a response object
        response = make_response(gzipped_protobuf_data)

        # Add headers to the response
        response.headers['Content-Disposition'] = f'attachment; filename={file_name}'
        response.headers['Content-Type'] = 'application/zip'
        response.headers['Content-Encoding'] = 'gzip'
        
        return jsonify({"message": "JSON received successfully"}), 200

    except Exception as e:
        logging.error(f'Error processing request: {str(e)}')
        return f'Error: {str(e)}', 500
    
    
# Route to get data from PostgreSQL and send it to UI
@app.route('/roja-metrics', methods=['GET'])
def get_latest_data():
    try:
        # Connect to the database
        logging.debug("Attempting database connection...")
        conn = conn = create_db_connection()
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001)
