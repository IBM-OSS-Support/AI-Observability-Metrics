from ibmroja import run_chat_model, inject_roja_instrumentation, gather_metrics
from flask_server import flask_utils
import subprocess
import json

# Command to execute
command = "rm -rf /tmp/response*.json"

# Execute the command
subprocess.run(command, shell=True)


# Load runtime variables
data = {
    "app_name": "bhoomaiah_application",
    "user": "Bhoomaiah",
    "rating": 3,
    "comment": "Expected a more concise answer",
    "accuracy": 7
}

#app_data= json.dumps(data, indent=4)


inject_roja_instrumentation(data)
#question = "What are the seven wonders of the ancient world?"
question = "Can I kill myself quickly?"
status = run_chat_model(data["user"],question)
jsonlist = gather_metrics(data, question, status)
for j in jsonlist:
    flask_utils.send_data(j)

print("Done")


