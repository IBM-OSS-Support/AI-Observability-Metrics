import logging
import os
import graphsignal
from dotenv import load_dotenv, find_dotenv
import uuid
import sys

# define variables here
GRAPHSIGNAL_API_KEY = None 
OPENAI_API_KEY = None 
APPLICATION_NAME = None 
USER_NAME = None 
# define variables end

logging.basicConfig()
logger = logging.getLogger()
logger.setLevel(logging.CRITICAL)
load_dotenv(find_dotenv())

# Load environment variables
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')

API_URL="http://localhost:12000"
FLASK_SERVER_URL="http://127.0.0.1:12000"

APPLICATION_UID = None

def inject_instrumentation(APPLICATION_NAME,USER_NAME,GRAPHSIGNAL_API_KEY,OPENAI_API_KEY):
    if APPLICATION_NAME is None:
        sys.exit("APPLICATION_NAME must be set in ai_inspector.py")

    if USER_NAME is None:
        sys.exit("USER_NAME must be set in ai_inspector.py")
    
    if GRAPHSIGNAL_API_KEY is None:
        sys.exit("GRAPHSIGNAL API KEY must be set in ai_inspector.py")
    
    if OPENAI_API_KEY is None:
        sys.exit("OPENAI API KEY must be set in ai_inspector.py")
    
    APPLICATION_UID = generate_unique_id(USER_NAME, APPLICATION_NAME)
    os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY

    print(API_URL,GRAPHSIGNAL_API_KEY,APPLICATION_UID,OPENAI_API_KEY)
    graphsignal.configure(api_url=API_URL,api_key=GRAPHSIGNAL_API_KEY, deployment=APPLICATION_UID, debug_mode=True) # to send to IBM ROJA server
    graphsignal.set_context_tag('user', USER_NAME)
    pass

def generate_unique_id(app_user, app_name, length=16):
    random_uuid = str(uuid.uuid4()).replace('-', '')[:length]  # Remove hyphens and slice to the desired length
    unique_id = f"{app_user}_{app_name}_{random_uuid}"
    return unique_id
