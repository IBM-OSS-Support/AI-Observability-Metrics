import sys
from flask import Flask, request, make_response, jsonify
import os
import json
import logging
from flask_cors import CORS
from dotenv import load_dotenv


#/root/roja-project/roja-metric-poc/applications/kafka_roja
#sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import postgres

load_dotenv()

app = Flask(__name__)
CORS(app)

# Set up basic logginglogging.basicConfig(level=logging.DEBUG)
logging.basicConfig(level=logging.DEBUG)

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
        logging.debug("Received request: /additional_metrics")
        data = request.get_json()
        #with open("application_id", "r") as file:
        #    content = file.read()
        #data["application-id"] = content
        postgres.upload_to_postgres_with_message(data)
        return jsonify({"message": "additional metrics JSON received successfully"}), 200
    except Exception as e:
        logging.exception(f'Error processing request: {str(e)}')
        return f'Error: {str(e)}', 500
    
@app.route('/application_id', methods=['POST'])
def create_application_id():
    try:
        logging.debug("Received request: /application_id")
        data = request.get_json()
        with open("application_id", "w") as file:
            file.write(data["app_id"])
        return jsonify({"message": "application_id JSON received successfully"}), 200
    except Exception as e:
        logging.exception(f'Error processing request: {str(e)}')
        return f'Error: {str(e)}', 500

@app.route('/anthropic_metrics', methods=['POST'])
def upload_anthropic():
    try:
        print("ANTHROPIC METRICS IN FLASK_APP")
        logging.debug("Received request: /anthropic_metrics")
        data = request.get_json()
        postgres.upload_to_postgres_with_message(data)
        print("Data which is sent is: ", data)
        return jsonify({"message": "Anthropic metrics JSON received successfully"}), 200
    except Exception as e:
        logging.exception(f'Error processing request: {str(e)}')
        return f'Error: {str(e)}', 500


@app.route('/api/v1/scores/', methods=['POST'])
def upload_through_rest_scores():
    
    try:
        logging.debug("Received request: /api/v1/scores/")
        data = request.get_json()

        file_path = '/tmp/scores.json'

        # Open the file in write mode and use json.dump() to write the data
        #with open(file_path, 'w') as file:
        #    json.dump(data, file)
        postgres.upload_to_postgres_with_message(data)
        return jsonify({"message": "scores JSON received successfully"}), 200
    except Exception as e:
        logging.exception(f'Error processing request: {str(e)}')
        return f'Error: {str(e)}', 500

@app.route('/api/v1/logs/', methods=['POST'])
def upload_through_rest_logs():
    
    try:
        logging.debug("Received request: /api/v1/logs/")
        data = {
            "kafka-topic":"logs",
            "logs":request.get_json()
        }
        #file_path = '/tmp/logs.json'

        # Open the file in write mode and use json.dump() to write the data
        #with open(file_path, 'w') as file:
        #    json.dump(data, file)
        #postgres.upload_to_postgres_with_message(data)
        return jsonify({"message": "logs JSON received successfully"}), 200
    except Exception as e:
        logging.exception(f'Error processing request: {str(e)}')
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
        #with open("application_id", "r") as file:
        #    content = file.read()
        #data["application-id"] = content
        # Open the file in write mode and use json.dump() to write the data
        #with open(file_path, 'w') as file:
        #    json.dump(data, file)
        postgres.upload_to_postgres_with_message(data)
        return jsonify({"message": "spans JSON received successfully"}), 200
    except Exception as e:
        logging.exception(f'Error processing request: {str(e)}')
        return f'Error: {str(e)}', 500

@app.route('/api/v1/metrics/', methods=['POST'])
def upload_through_rest_metrics():
    
    try:
        logging.debug("Received request: /api/v1/metrics/")
        jdata = request.get_json()
        
        data = {
            "kafka-topic":"metrics",
            "app-user":extract_application_user(jdata),
            "application-name": extract_application_name(jdata),
            "token-cost":0,
            "metrics":jdata
        }
        #with open("application_id", "r") as file:
        #    content = file.read()
        #data["application-id"] = content
        #file_path = '/tmp/metrics.json'

        # Open the file in write mode and use json.dump() to write the data
        #with open(file_path, 'w') as file:
        #    json.dump(data, file)
        postgres.upload_to_postgres_with_message(data)
        return jsonify({"message": "metrics JSON received successfully"}), 200
    except Exception as e:
        logging.exception(f'Error processing request: {str(e)}')
        return f'Error: {str(e)}', 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001)
