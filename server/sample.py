import logging
import time
import os
import random
from langchain.agents import initialize_agent, load_tools
from langchain.chat_models import ChatOpenAI
import graphsignal
from dotenv import load_dotenv, find_dotenv


logging.basicConfig()
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
load_dotenv(find_dotenv())

# Load environment variables
#API_URL = os.getenv('API_URL')
API_URL = "http://127.0.0.1:5000"
GRAPHSIGNAL_API_KEY = os.getenv('GRAPHSIGNAL_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
DEPLOYMENT = os.getenv('deployment')

# graphsignal.configure(api_url=API_URL,api_key=GRAPHSIGNAL_API_KEY, deployment=DEPLOYMENT) # to send to flask app

graphsignal.configure(api_key=GRAPHSIGNAL_API_KEY, deployment=DEPLOYMENT) # to send to graphsignal dashboard

def solve(user_id, task):
    graphsignal.set_context_tag('user', user_id)

    llm = ChatOpenAI(temperature=0)
    tools = load_tools(["llm-math"], llm=llm)
    agent = initialize_agent(
        tools, llm, agent="zero-shot-react-description", verbose=True
    )
    agent.run(task)



id = random.randint(0, 10)
num = 38

try:
    solve(f'user{id}', f"What is {num} raised to .123243 power?")
    logger.debug('Task solved')
except:
    logger.error("Error while solving task", exc_info=True)


print("Done")