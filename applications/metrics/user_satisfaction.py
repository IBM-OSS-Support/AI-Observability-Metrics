import json
import requests
import datetime
from dateutil.relativedelta import relativedelta
from openai import OpenAI
import graphsignal

openai_api_key = "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" #os.getenv('OPENAI_API_KEY')
APPLICATION_METRIC = "user_satisfaction"

def prepare_user_satisfaction(user, app_name, question, rating, comment):

    result_info = {
        "kafka-topic" : APPLICATION_METRIC,
        "rating" : rating,
        "comment" : comment,
        "app-user" : user,
        "application-name" : app_name,
    }
    # Write the system info to a JSON file
    with open("user_satisfaction.json", "w") as json_file:
        json.dump(result_info, json_file, indent=4)
    return result_info

    
