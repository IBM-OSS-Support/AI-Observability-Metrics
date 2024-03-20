from ibmroja import run_chat_model, inject_roja_instrumentation, gather_metrics
from flask_server import flask_utils
import subprocess

# Command to execute
command = "rm -rf /tmp/response*.json"

# Execute the command
subprocess.run(command, shell=True)


# Load runtime variables
APPLICATION_NAME = "bhoomaiah_application"
USER = "Bhoomaiah"

inject_roja_instrumentation(APPLICATION_NAME, USER)

question = "What are the seven wonders of the ancient world?"
run_chat_model(USER, question)
#jsonlist = gather_metrics(USER, APPLICATION_NAME, question)
#for j in jsonlist:
#    flask_utils.send_data(j)


print("Done")


