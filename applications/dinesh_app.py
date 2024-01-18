import logging
import random
from dotenv import load_dotenv, find_dotenv
from ibmroja import solve, inject_roja_instrumentation

logging.basicConfig()
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
load_dotenv(find_dotenv())

# Load runtime variables
APPLICATION_NAME = "dinesh_application"
USER = "Dinesh"

inject_roja_instrumentation(APPLICATION_NAME, USER)
id = random.randint(0, 10)
num = 38

try:
    solve(f'{USER}', f"What is {num} raised to .122231 power?")
    logger.debug('Task solved')
except:
    logger.error("Error while solving task", exc_info=True)

print("Done")


