import logging
import os
from langchain.agents import initialize_agent, load_tools
#from langchain.chat_models import ChatOpenAI
#from langchain_community.chat_models import ChatOpenAI
from langchain_openai import ChatOpenAI
import graphsignal
from dotenv import load_dotenv, find_dotenv
import random
import anthropic
from langchain.prompts import ChatPromptTemplate
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.llms import OpenAI
from langchain.chains import RetrievalQA
from langchain_community.document_loaders import TextLoader
from metrics import safety_score, log_app, maintenance, session, embeddings, user_satisfaction, accuracy
import time

logging.basicConfig()
logger = logging.getLogger()
logger.setLevel(logging.CRITICAL)
load_dotenv(find_dotenv())

#logging.basicConfig()
#logger = logging.getLogger()
#logger.setLevel(logging.DEBUG)
#load_dotenv(find_dotenv())

# Load environment variables
API_URL = os.getenv('API_URL')
GRAPHSIGNAL_API_KEY = os.getenv('GRAPHSIGNAL_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')

def inject_roja_instrumentation(app_data):
    print(API_URL,GRAPHSIGNAL_API_KEY,app_data["app_name"])
    graphsignal.configure(api_url=API_URL,api_key=GRAPHSIGNAL_API_KEY, deployment=app_data["app_name"]) # to send to IBM ROJA server
    graphsignal.set_context_tag('user', app_data["user"])
    pass

def solve(user_id, task):
    try:
        graphsignal.set_context_tag('user', user_id)

        llm = ChatOpenAI(temperature=0)
        tools = load_tools(["llm-math"], llm=llm)
        agent = initialize_agent(
            tools, llm, agent="zero-shot-react-description", verbose=True
        )
        agent.run(task)
        logger.debug('Task solved')
        return "success"
    except:
        logger.debug("Error while solving task", exc_info=True)
        return "failure"

def run_chat_model(USER, question):
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
        logger.debug("An error occurred: ", exc_info=e)
        return "failure"
    
def answer_questions(user_id, questions):
    try:
        loader = TextLoader('data.txt')
        documents = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
        texts = text_splitter.split_documents(documents)
        time.sleep(10)
        embeddings = OpenAIEmbeddings()
        vectordb = Chroma.from_documents(texts, embeddings)
        # Initialize the ChatOpenAI model
        llm = ChatOpenAI(temperature=0)
        graphsignal.set_context_tag('user', user_id)

        for question in questions:
            qa = RetrievalQA.from_chain_type(llm=OpenAI(), chain_type="stuff", retriever=vectordb.as_retriever())
            qa.run(question)
        return "success"
    except Exception as e:
        # Handle any exceptions that occur
        # Assuming logger is properly set up
        logger.debug("An error occurred while processing the questions", exc_info=True)
        return "failure"

def run_anthropic_model(user, question):

    client = anthropic.Anthropic(api_key = ANTHROPIC_API_KEY)

    response = client.messages.create(
        model = "claude-3-opus-20240229",
        max_tokens = 200,
        messages = [
            {"role": "user", "content": question}]
    )
    return response


def gather_metrics(app_data, question, status):
    json_obj = []
    json_obj.append(safety_score.calculate_safety_score(app_data["user"], app_data["app_name"], question))
    json_obj.append(log_app.log_prompt_info(app_data["user"], app_data["app_name"], question, status))
    #json_obj.append(maintenance.get_maintenance_info(app_data["user"], app_data["app_name"]))
    #json_obj.append(session.get_session_info(app_data["user"], app_data["app_name"]))
    json_obj.append(user_satisfaction.prepare_user_satisfaction(app_data["user"], app_data["app_name"],question,app_data["rating"],app_data["comment"]))
    json_obj.append(accuracy.prepare_accuracy(app_data["user"], app_data["app_name"], app_data["accuracy"]))
    return json_obj
