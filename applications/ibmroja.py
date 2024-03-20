import logging
import os
from langchain.agents import initialize_agent, load_tools
#from langchain.chat_models import ChatOpenAI
#from langchain_community.chat_models import ChatOpenAI
from langchain_openai import ChatOpenAI
import graphsignal
from dotenv import load_dotenv, find_dotenv
import random
from langchain.prompts import ChatPromptTemplate
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.llms import OpenAI
from langchain.chains import RetrievalQA
from langchain_community.document_loaders import TextLoader
from metrics import safety_score, log_app, maintenance, session, embeddings

logging.basicConfig()
logger = logging.getLogger()
logger.setLevel(logging.CRITICAL)
load_dotenv(find_dotenv())

logging.basicConfig()
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
load_dotenv(find_dotenv())

# Load environment variables
API_URL = os.getenv('API_URL')
GRAPHSIGNAL_API_KEY = os.getenv('GRAPHSIGNAL_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

def inject_roja_instrumentation(APPLICATION_NAME, USER):
    print(API_URL,GRAPHSIGNAL_API_KEY,APPLICATION_NAME)
    graphsignal.configure(api_url=API_URL,api_key=GRAPHSIGNAL_API_KEY, deployment=APPLICATION_NAME) # to send to IBM ROJA server
    #graphsignal.configure(deployment=APPLICATION_NAME)
    graphsignal.set_context_tag('user', USER)
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
    except:
        logger.error("Error while solving task", exc_info=True)    

def run_chat_model(user_id, question):
    print("tahsin")
    try:
        llm = ChatOpenAI(temperature=0)
        graphsignal.set_context_tag('user', user_id)
        prompt = ChatPromptTemplate.from_messages([
        ("system", "You're a very knowledgeable historian who provides accurate and eloquent answers to historical questions."),
        ("human", "{question}")
        ])
        runnable = prompt | llm

        #with graphsignal.start_trace("predict", {"record_samples": True, "record_metrics":True, "enable_profiling":True}):
        with graphsignal.trace('tahsn') as span:
            #span.set_payload('input', input_data, usage=dict(token_count=input_token_count))
            for chunk in runnable.stream({"question": question}):
                print(chunk, end="", flush=True)

    except Exception as e:
        logger.error("An error occurred: ", exc_info=e)
    
def answer_questions(user_id, questions):
    try:
        loader = TextLoader('data.txt')
        documents = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
        texts = text_splitter.split_documents(documents)

        embeddings = OpenAIEmbeddings()
        vectordb = Chroma.from_documents(texts, embeddings)
        # Initialize the ChatOpenAI model
        llm = ChatOpenAI(temperature=0)
        graphsignal.set_context_tag('user', user_id)

        for question in questions:
            qa = RetrievalQA.from_chain_type(llm=OpenAI(), chain_type="stuff", retriever=vectordb.as_retriever())
            qa.run(question)
    except Exception as e:
        # Handle any exceptions that occur
        # Assuming logger is properly set up
        logger.error("An error occurred while processing the questions", exc_info=True)


def gather_metrics(user, app_name, question):
    json_obj = []
    json_obj.append(safety_score.calculate_safety_score(user, app_name, question))
    json_obj.append(log_app.log_prompt_info(user, app_name, question))
    json_obj.append(maintenance.get_maintenance_info(user,app_name))
    json_obj.append(session.get_session_info(user,app_name))
    json_obj.append(embeddings.get_embeddings_score(user,app_name,question,"text-embedding-3-small"))
    return json_obj
