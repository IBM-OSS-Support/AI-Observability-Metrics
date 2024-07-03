from ibmroja import run_anthropic_model, inject_roja_instrumentation
from metrics import anthropic_metrics
from flask_server import flask_utils

# Load runtime variables
APPLICATION_NAME = "Anthropic_application"
USER = "Harsh"
api_key='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'

question = "What are your views on pineapple on pizza?"
response = run_anthropic_model(USER, question)

print("Response: ", response) # TESTING

data = {
    "app_name": APPLICATION_NAME,
    "user": USER,
}

inject_roja_instrumentation(data) 

json_obj = anthropic_metrics.anthropic_metrics_json(data, response)

print("FINAL JSON_OBJ: ", json_obj)

flask_utils.send_anthropic_data(json_obj)

print("\nSent to server")