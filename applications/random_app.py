import random
from ibmroja import run_chat_model, inject_roja_instrumentation, gather_metrics, generate_unique_id
from flask_server import flask_utils
import subprocess
import json

# Command to execute
command = "rm -rf /tmp/response*.json"
subprocess.run(command, shell=True)

# List of 20 random questions
questions = [
    "What is the meaning of life?",
    "How does quantum computing work?",
    "What are the seven wonders of the ancient world?",
    "How can I improve my coding skills?",
    "What is the history of the internet?",
    "Why is the sky blue?",
    "How do airplanes stay in the air?",
    "What is the most effective way to learn a new language?",
    "Can you explain the theory of relativity?",
    "What is artificial intelligence?",
    "How do black holes form?",
    "What are the benefits of meditation?",
    "Can you explain blockchain technology?",
    "How do plants perform photosynthesis?",
    "What is the purpose of art?",
    "How do vaccines work?",
    "What is the future of renewable energy?",
    "Can you tell me about the Big Bang theory?",
    "What is machine learning?",
    "How does GPS work?"
]

# Randomly select a question
question = random.choice(questions)

# Generate random username and application name
usernames = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Hannah", "Ivy", "Jack"]
app_names = ["app_alpha", "app_beta", "app_gamma", "app_delta", "app_epsilon"]

random_user = random.choice(usernames)
random_app_name = random.choice(app_names)

# Load runtime variables
data = {
    "app_name": random_app_name,
    "user": random_user,
    "rating": random.randint(1, 5),  # Random rating between 1 and 5
    "comment": "Expected a more concise answer",
    "accuracy": random.randint(5, 10)  # Random accuracy between 5 and 10
}

flask_utils.send_app_id_data({"app_id":generate_unique_id(data["user"],data["app_name"],length=16)})
inject_roja_instrumentation(data)

# Run chat model
status = run_chat_model(data["user"], question)

# Gather and send metrics
jsonlist = gather_metrics(data, question, status)
for j in jsonlist:
    flask_utils.send_data(j)

print("Done")

