import sys
from flask import Flask, request, make_response, jsonify
import os
import json
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

def extract_application_name(data_obj):
    if isinstance(data_obj, list):
        for item in data_obj:
            if 'tags' in item and isinstance(item['tags'], list):
                for tag in item['tags']:
                    if tag.get('key') == 'deployment':
                        return tag.get('value')
    return None
        
def extract_application_user(data_obj):
    if isinstance(data_obj, list):
        for item in data_obj:
            if 'tags' in item and isinstance(item['tags'], list):
                for tag in item['tags']:
                    if tag.get('key') == 'user':
                        return tag.get('value')
    return None

@app.route('/additional_metrics', methods=['POST'])
def upload_additional():
    try:
        print("tahsin in /addtional_signals")
        logging.debug("Received request: /additional_metrics")
        data = request.get_json()
        producer.kafka_producer(data)
        return jsonify({"message": "additional metrics JSON received successfully"}), 200
    except Exception as e:
        logging.error(f'Error processing request: {str(e)}')
        return f'Error: {str(e)}', 500
    

@app.route('/anthropic_metrics', methods=['POST'])
def upload_anthropic():
    try:
        print("ANTHROPIC METRICS IN FLASK_APP")
        logging.debug("Received request: /anthropic_metrics")
        data = request.get_json()
        producer.kafka_producer(data)
        print("Data which is sent is: ", data)
        return jsonify({"message": "Anthropic metrics JSON received successfully"}), 200
    except Exception as e:
        logging.error(f'Error processing request: {str(e)}')
        return f'Error: {str(e)}', 500


@app.route('/api/v1/scores/', methods=['POST'])
def upload_through_rest_scores():
    
    try:
        print("tahsin in /api/v1/scores/")
        logging.debug("Received request: /api/v1/scores/")
        data = request.get_json()

        file_path = '/tmp/scores.json'

        # Open the file in write mode and use json.dump() to write the data
        with open(file_path, 'w') as file:
            json.dump(data, file)
        producer.kafka_producer(data)
        return jsonify({"message": "scores JSON received successfully"}), 200
    except Exception as e:
        logging.error(f'Error processing request: {str(e)}')
        return f'Error: {str(e)}', 500

@app.route('/api/v1/logs/', methods=['POST'])
def upload_through_rest_logs():
    
    try:
        print("tahsin in /api/v1/logs/")
        logging.debug("Received request: /api/v1/logs/")
        data = {
            "kafka-topic":"logs",
            "logs":request.get_json()
        }
        file_path = '/tmp/logs.json'

        # Open the file in write mode and use json.dump() to write the data
        with open(file_path, 'w') as file:
            json.dump(data, file)
        #producer.kafka_producer(data)
        return jsonify({"message": "logs JSON received successfully"}), 200
    except Exception as e:
        logging.error(f'Error processing request: {str(e)}')
        return f'Error: {str(e)}', 500

@app.route('/api/v1/spans/', methods=['POST'])
def upload_through_rest_spans():
    
    try:
        print("in /api/v1/spans/")
        logging.debug("Received request: /api/v1/spans/")
        jdata = request.get_json()
        data = {
            "kafka-topic":"spans",
            "app-user":extract_application_user(jdata),
            "application-name": extract_application_name(jdata),
            "spans":request.get_json()
        }

        file_path = '/tmp/spans.json'

        # Open the file in write mode and use json.dump() to write the data
        with open(file_path, 'w') as file:
            json.dump(data, file)
        producer.kafka_producer(data)
        return jsonify({"message": "spans JSON received successfully"}), 200
    except Exception as e:
        logging.error(f'Error processing request: {str(e)}')
        return f'Error: {str(e)}', 500

@app.route('/api/v1/metrics/', methods=['POST'])
def upload_through_rest_metrics():
    
    try:
        print("tahsin in /api/v1/metrics/")
        logging.debug("Received request: /api/v1/metrics/")
        jdata = request.get_json()
        
        data = {
            "kafka-topic":"metrics",
            "app-user":extract_application_user(jdata),
            "application-name": extract_application_name(jdata),
            "token-cost":0,
            "metrics":jdata
        }

        file_path = '/tmp/metrics.json'

        # Open the file in write mode and use json.dump() to write the data
        with open(file_path, 'w') as file:
            json.dump(data, file)
        producer.kafka_producer(data)
        return jsonify({"message": "metrics JSON received successfully"}), 200
    except Exception as e:
        logging.error(f'Error processing request: {str(e)}')
        return f'Error: {str(e)}', 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001)
