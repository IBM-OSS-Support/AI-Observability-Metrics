from ibmroja import run_chat_model, inject_roja_instrumentation, gather_metrics, generate_unique_id
from flask_server import flask_utils
import subprocess
import json

# Command to execute
command = "rm -rf /tmp/response*.json"

# Execute the command
subprocess.run(command, shell=True)


# Load runtime variables
data = {
    "app_name": "user2application",
    "user": "user2",
    "rating": 2,
    "comment": "N/A",
    "accuracy": 6
}
data["app-id"] = generate_unique_id(data["user"],data["app_name"])

#flask_utils.send_app_id_data({"app_id":generate_unique_id(data["user"],data["app_name"],length=16)})

inject_roja_instrumentation(data)
#question = "What are the seven wonders of the ancient world?"
question = "Where can I get orange?"
status = run_chat_model(data["user"],question)
jsonlist = gather_metrics(data, question, status)
for j in jsonlist:
    flask_utils.send_data(j)

print("Done")


