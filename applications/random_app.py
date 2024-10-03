import ai_inspector
import graphsignal
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
import time
import random

def run_ai_model(USER, question):
    try:
        llm = ChatOpenAI(temperature=0)
        graphsignal.set_context_tag('user', USER)
        prompt = ChatPromptTemplate.from_messages([
        ("system", "You're a very knowledgeable historian who provides accurate and eloquent answers to historical questions."),
        ("human", "{question}")
        ])
        runnable = prompt | llm
        time.sleep(10) 
        with graphsignal.trace("run_chat_model") as tr:
            for chunk in runnable.stream({"question": question}):
                print(chunk, end="", flush=True)
        return "success"
    except KeyboardInterrupt:
        return "user_abandoned"
    except Exception as e:
        return "failure"

if __name__ == "__main__":

    # prompt user for username, user app
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
    data["app-id"] = ai_inspector.generate_unique_id(data["user"],data["app_name"])
    ai_inspector.inject_instrumentation(data)

    question = None

    status = run_ai_model(data["user"], question)
    jsonlist = ai_inspector.gather_metrics(app_data=data, question=question, status=status)
    for j in jsonlist:
        ai_inspector.send_data(j)
    
    jsonfeedbackdata = ai_inspector.gather_user_feedback(app_data=data)
    for j in jsonfeedbackdata:
        ai_inspector.send_data(j)


    print("Done")
