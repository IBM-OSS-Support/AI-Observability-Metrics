import random
from ibmroja import inject_roja_instrumentation, gather_metrics, solve, generate_unique_id
from flask_server import flask_utils
import subprocess
import json

# Command to execute
command = "rm -rf /tmp/response*.json"
subprocess.run(command, shell=True)

# List of 20 random mathematical questions
questions = [
    "What is the cos of 38 degrees?",
    "How do you solve the quadratic equation ax^2 + bx + c = 0?",
    "What is the derivative of sin(x)?",
    "What is the integral of x^2?",
    "How do you find the area of a circle?",
    "What is the value of pi to 5 decimal places?",
    "How do you calculate the volume of a sphere?",
    "What is the Pythagorean theorem?",
    "How do you convert radians to degrees?",
    "What is the Fibonacci sequence?",
    "How do you solve for x in the equation log(x) = 2?",
    "What is the difference between permutations and combinations?",
    "How do you find the eigenvalues of a matrix?",
    "What is the value of e (Euler's number)?",
    "How do you calculate the standard deviation of a data set?",
    "What is the binomial theorem?",
    "How do you solve a system of linear equations?",
    "What is the fundamental theorem of calculus?",
    "How do you calculate the determinant of a matrix?",
    "What is the Riemann hypothesis?"
]

# Randomly select a question
question = random.choice(questions)

# Generate random username and application name
usernames = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Hannah", "Ivy", "Jack"]
app_names = ["math_app_alpha", "math_app_beta", "math_app_gamma", "math_app_delta", "math_app_epsilon"]

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
data["app-id"] = generate_unique_id(data["user"],data["app_name"])
#flask_utils.send_app_id_data({"app_id":generate_unique_id(data["user"],data["app_name"],length=16)})
inject_roja_instrumentation(data)

# Run chat model
status = solve(data["user"], question)

# Gather and send metrics
jsonlist = gather_metrics(data, question, status)
for j in jsonlist:
    flask_utils.send_data(j)

print("Done")


