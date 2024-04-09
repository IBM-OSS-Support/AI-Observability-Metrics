from ibmroja import solve, inject_roja_instrumentation, gather_metrics
from flask_server import flask_utils

# Load runtime variables
APPLICATION_NAME = "vikram_application"
USER = "Vikram"

inject_roja_instrumentation(APPLICATION_NAME, USER)


question = "What is the cos of 38?"
#solve(f'{USER}', f"What is the cos of 38?")
status = solve(USER,question)
jsonlist = gather_metrics(USER, APPLICATION_NAME, question, status)
for j in jsonlist:
    flask_utils.send_data(j)

print("Done")


