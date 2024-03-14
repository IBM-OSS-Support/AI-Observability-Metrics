import openai
import json
#from langchain.chat_models import ChatOpenAI
import graphsignal
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
import os

client = openai.OpenAI(api_key="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")
'''APPLICATION_NAME = "tahsin_application"
USER = "Tahsin"
PROMPT = "What is the significance of the uncertainty principle in quantum mechanics?"
APPLICATION_METRIC = "log_history"
GRAPHSIGNAL_API_KEY = "162b87ea6903abade57d45c2379e2974"
OPENAI_API_KEY = "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"
API_URL = "http://127.0.0.1:5000"
'''
APPLICATION_METRIC = "log_history"

# Then to run a prompt:

def log_prompt_info(user, application_name, question):
    graphsignal.set_context_tag('user', user)
    with graphsignal.start_trace('predict', options=graphsignal.TraceOptions(record_samples= True, record_metrics=True, enable_profiling=True)):
        chat_completion = client.chat.completions.create(
            messages=[{
                "role": "user",
                "content": question,
            }],
            model="gpt-3.5-turbo",
        )

        # Extract attributes for serialization
        chat_completion_dict = {
            "kafka_topic": APPLICATION_METRIC,
            "id": chat_completion.id,
            "created": chat_completion.created,
            "model": chat_completion.model,
            "object": chat_completion.object,
            "system_fingerprint":chat_completion.system_fingerprint,
            "completion_usage": {
                "completion_tokens": chat_completion.usage.completion_tokens,
                "prompt_tokens": chat_completion.usage.prompt_tokens,
                "total_tokens": chat_completion.usage.total_tokens
            },
            "user":user,
            "app_name":application_name,
            "prompt":question,
            "choices": [{
                "message": {
                    "model_config": choice.message.model_config,
                    "content": choice.message.content,
                    "function_call": choice.message.function_call,
                    "role": choice.message.role,
                    "tool_calls": choice.message.tool_calls
                },
                "index": choice.index,
                "finish_reason": choice.finish_reason,
                "logprobs":choice.logprobs
            } for choice in chat_completion.choices]
        }

        print(chat_completion.choices[0].message.content)
        print(chat_completion)
        # Serialize chat_completion to JSON
        #chat_completion_json = chat_completion.to_dict()

        # Write JSON to file
        with open('log_history.json', 'w') as json_file:
            json.dump(chat_completion_dict, json_file, indent=4)
    
    return chat_completion_dict