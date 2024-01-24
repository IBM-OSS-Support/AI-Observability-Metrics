from ibmroja import run_chat_model, inject_roja_instrumentation

# Load runtime variables
APPLICATION_NAME = "bhoomaiah_application"
USER = "Bhoomaiah"

inject_roja_instrumentation(APPLICATION_NAME, USER)

question = "What are the seven wonders of the ancient world?"
run_chat_model(USER, question)

print("Done")


