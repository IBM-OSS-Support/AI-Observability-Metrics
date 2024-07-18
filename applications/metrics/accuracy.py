import json
import requests
import datetime
from dateutil.relativedelta import relativedelta
from openai import OpenAI
import graphsignal

APPLICATION_METRIC = "accuracy"

def prepare_accuracy(user, app_name, accuracy):

    result_info = {
        "kafka-topic" : APPLICATION_METRIC,
        "accuracy" : accuracy,
        "app-user" : user,
        "application-name" : app_name,
    }
    # Write the system info to a JSON file
    with open("metrics/jsons/accuracy.json", "w") as json_file:
        json.dump(result_info, json_file, indent=4)
    return result_info

    
