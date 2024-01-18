import logging
from dotenv import load_dotenv, find_dotenv
from ibmroja import solve, inject_roja_instrumentation

logging.basicConfig()
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
load_dotenv(find_dotenv())

# Load runtime variables
APPLICATION_NAME = "vikram_application"
USER = "Vikram"

inject_roja_instrumentation(APPLICATION_NAME, USER)

try:
    solve(f'{USER}', f"Can you generate a writings on AI technology?")
    logger.debug('Task solved')
except:
    logger.error("Error while solving task", exc_info=True)


print("Done")


