import logging
import os
from langchain.agents import initialize_agent, load_tools
from langchain.chat_models import ChatOpenAI
import graphsignal
from dotenv import load_dotenv, find_dotenv

logging.basicConfig()
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
load_dotenv(find_dotenv())

# Load environment variables
API_URL = os.getenv('API_URL')
GRAPHSIGNAL_API_KEY = os.getenv('GRAPHSIGNAL_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

def inject_roja_instrumentation(APPLICATION_NAME, USER):
    graphsignal.configure(api_url=API_URL,api_key=GRAPHSIGNAL_API_KEY, deployment=APPLICATION_NAME) # to send to IBM ROJA server
    graphsignal.set_context_tag('user', USER)
    pass

def solve(user_id, task):
    graphsignal.set_context_tag('user', user_id)

    llm = ChatOpenAI(temperature=0)
    tools = load_tools(["llm-math"], llm=llm)
    agent = initialize_agent(
        tools, llm, agent="zero-shot-react-description", verbose=True
    )
    agent.run(task)


