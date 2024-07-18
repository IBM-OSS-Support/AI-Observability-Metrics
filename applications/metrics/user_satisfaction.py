import json
import requests
import datetime
from dateutil.relativedelta import relativedelta
from openai import OpenAI
import graphsignal

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
    with open("metrics/jsons/user_satisfaction.json", "w") as json_file:
        json.dump(result_info, json_file, indent=4)
    return result_info

    
