from ai_inspector import inject_instrumentation, inject_data
import graphsignal
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
import time

GRAPHSIGNAL_API_KEY = "7e6ff4494810b4cb37255d369cfae983"
OPENAI_API_KEY = "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"
APPLICATION_NAME = "tahsinapp"
USER_NAME = "tahsin61"

user_function = inject_instrumentation(APPLICATION_NAME,USER_NAME,GRAPHSIGNAL_API_KEY,OPENAI_API_KEY)

question = "What is the capital of France?"

@user_function
def user_ai_function():
    # user code begins
    print("Running user code")
    llm = ChatOpenAI(temperature=0)
    prompt = ChatPromptTemplate.from_messages([
    ("system", "You're a very knowledgeable historian who provides accurate and eloquent answers to historical questions."),
    ("human", "{question}")
    ])
    runnable = prompt | llm
    time.sleep(10) 
    with graphsignal.trace("run_chat_model") as tr:
        for chunk in runnable.stream({"question": question}):
            print(chunk, end="", flush=True)

inject_data(question=question,status=user_ai_function())