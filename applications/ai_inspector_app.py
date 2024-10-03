import ai_inspector
import graphsignal
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
import time

def run_ai_model(USER, question):
    try:
        '''
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
        '''
        return "success"
    except KeyboardInterrupt:
        return "user_abandoned"
    except Exception as e:
        return "failure"

if __name__ == "__main__":

    # prompt user for username, user app
    data = {
        "app_name": "app1",   ##### app name here
        "user": "tahsin" ##### app user name here
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


