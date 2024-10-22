import datetime
import logging
import os
import psycopg2
import json
import time
import socket

# auditing
import requests
import base64

# Set up basic logging
#logging.basicConfig(level=logging.CRITICAL)
logging.basicConfig(level=logging.DEBUG)

class Message_Single:
    def __init__(self, topic, value):
        self.topic = topic
        self.value = value

def upload_to_postgres_with_message(jsonobj):
    json_string = json.dumps(jsonobj)
    m = Message_Single(jsonobj["kafka-topic"], json_string)
    upload_to_postgres(m)



def calculate_openai_cost(token_count, rate_per_1000_tokens=0.002):
    """
    Calculate the cost for using a language model based on token usage.
    """
    return token_count / 1000 * rate_per_1000_tokens

def upload_to_postgres(message):
    print("Inside upload_to_postgres: ", message.topic)
    json_data = message.value
    json_object = json.loads(json_data)
    json_object_sanitized = json.dumps(json_object, default=lambda x: None if isinstance(x, float) and (x == float('inf') or x == float('-inf') or x != x) else x)
    json_object = json.loads(json_object_sanitized)
     
    conn = create_db_connection()

    topic_processing_functions = {
        'spans': process_spans,
        'metrics': process_metrics,
        'log_history': process_log_history,
        'session_info':process_session_info,
        'embedding':process_embedding,
        'user_satisfaction':process_user_satisfaction,
        'accuracy':process_accuracy,
        'anthropic_metrics': process_anthropic_metrics,
        'graphsignallogs': process_graphsignallogs
    }

    app_name = json_object["application-name"]
    app_user = json_object["app-user"]
    logging.debug(f"PROCESSING function: app_user: {app_user} app_name: {app_name}")

    processing_function = topic_processing_functions[message.topic]
    processing_function(message,conn,json_object)

def process_anthropic_metrics(message, conn, json_object):
    cursor = conn.cursor()
    # Create a table if it does not exist
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS anthropic_metrics (
            id SERIAL PRIMARY KEY,
            json_object TEXT,
            application_name TEXT,
            app_user TEXT,
            timestamp TIMESTAMP
    )
    """
    cursor.execute(create_table_sql)

    # Get the current timestamp
    current_timestamp = datetime.datetime.now()

    # SQL command to insert the JSON data along with 'application-name', 'tag', and timestamp
    insert_metric_sql = "INSERT INTO accuracy (json_object, application_name, app_user, timestamp) VALUES (%s, %s, %s, %s)"
    cursor.execute(insert_metric_sql, (json.dumps(json_object), json_object["application-name"], json_object["app-user"], current_timestamp))
    conn.commit()
    cursor.close()
    conn.close()


def process_accuracy(message,conn,json_object):
    cursor = conn.cursor()
    # Create a table if it does not exist
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS accuracy (
            id SERIAL PRIMARY KEY,
            accuracy_score INTEGER NULL,
            application_name TEXT,
            app_user TEXT,
            app_id TEXT UNIQUE,
            timestamp TIMESTAMP
    )
    """
    cursor.execute(create_table_sql)

    # Get the current timestamp
    current_timestamp = datetime.datetime.now()

    # SQL command to insert the JSON data along with 'application-name', 'tag', and timestamp
    insert_metric_sql = "INSERT INTO accuracy (accuracy_score, application_name, app_user, app_id, timestamp) VALUES (%s, %s, %s, %s, %s)"
    cursor.execute(
        insert_metric_sql, 
        (
            json.dumps(json_object.get("accuracy", -1)),
            json_object.get("application-name", None),
            json_object.get("app-user", None),
            json_object.get("application-name", None),  # Assuming you're using "application-name" as "app_id"
            current_timestamp  # Make sure current_timestamp is defined
        )
    )
    conn.commit()
    cursor.close()
    conn.close()

def process_user_satisfaction(message,conn,json_object):
    cursor = conn.cursor()
    # Create a table if it does not exist
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS user_satisfaction (
            id SERIAL PRIMARY KEY,
            rating INTEGER NULL,
            comment TEXT NULL,
            application_name TEXT,
            app_user TEXT,
            app_id TEXT,
            timestamp TIMESTAMP
    )
    """
    cursor.execute(create_table_sql)

    # Get the current timestamp
    current_timestamp = datetime.datetime.now()

    # SQL command to insert the JSON data along with 'application-name', 'tag', and timestamp
    insert_metric_sql = "INSERT INTO user_satisfaction (rating, comment, application_name, app_user, app_id, timestamp) VALUES (%s, %s, %s, %s, %s, %s)"
    cursor.execute(
        insert_metric_sql, 
        (
            json.dumps(json_object.get("rating", -1)),      # Handling "rating"
            json_object.get("comment", None),                 # Handling "comment"
            json_object.get("application-name", None),        # Handling "application_name"
            json_object.get("app-user", None),                # Handling "app_user"
            json_object.get("application-name", None),        # Assuming "application-name" is also used as "app_id"
            current_timestamp                                 # Ensure current_timestamp is defined
        )
    )
    conn.commit()
    cursor.close()
    conn.close()

def process_embedding(message,conn,json_object):
    cursor = conn.cursor()
    # Create a table if it does not exist
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS embeddings (
            id SERIAL PRIMARY KEY,
            embedding JSONB,
            model TEXT,
            usage JSONB,
            application_name TEXT,
            app_user TEXT,
            timestamp TIMESTAMP
    )
    """
    cursor.execute(create_table_sql)

    # Get the current timestamp
    current_timestamp = datetime.datetime.now()

    # SQL command to insert the JSON data along with 'application-name', 'tag', and timestamp
    insert_metric_sql = "INSERT INTO embeddings (embedding, model, usage, application_name, app_user, timestamp) VALUES (%s, %s, %s, %s, %s, %s)"
    cursor.execute(insert_metric_sql, (json.dumps(json_object["data"]), json_object["model"], json.dumps(json_object["usage"]),json_object["application-name"], json_object["app-user"], current_timestamp))

    conn.commit()
    cursor.close()
    conn.close()

def process_session_info(message,conn,json_object):
    cursor = conn.cursor()
    # Create a table if it does not exist
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS session_info (
            id SERIAL PRIMARY KEY,
            sessions JSONB,
            application_name TEXT,
            app_user TEXT,
            timestamp TIMESTAMP
    )
    """
    cursor.execute(create_table_sql)

    # Get the current timestamp
    current_timestamp = datetime.datetime.now()

    # SQL command to insert the JSON data along with 'application-name', 'tag', and timestamp
    insert_metric_sql = "INSERT INTO session_info (sessions, application_name, app_user, timestamp) VALUES (%s, %s, %s, %s)"
    cursor.execute(insert_metric_sql, (json.dumps(json_object["sessions"]), json_object["application-name"], json_object["app-user"], current_timestamp))

    conn.commit()
    cursor.close()
    conn.close()

def process_log_history(message,conn,json_object):
    cursor = conn.cursor()
    # Create a table if it does not exist
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS log_history (
            id SERIAL PRIMARY KEY,
            log JSONB NULL,
            status TEXT NULL,
            finish_reason TEXT NULL, 
            application_name TEXT,
            app_user TEXT,
            app_id TEXT UNIQUE,
            timestamp TIMESTAMP
    )
    """
    cursor.execute(create_table_sql)

    # Get the current timestamp
    current_timestamp = datetime.datetime.now()

    def extract_completion_status(json_object):
        status = "unknown"
        finish_reason = "unknown"
        if "choices" in json_object:
            for choice in json_object["choices"]:
                if "finish_reason" in choice:
                    finish_reason = choice["finish_reason"]
                    if finish_reason == "stop":
                        status = "success"
                    else:
                        status = "failure"
        return status, finish_reason 

    completion_status, finish_reason = extract_completion_status(json_object)
    
    status = json_object["status"]
    print(type(status), type(finish_reason))
    # SQL command to insert the JSON data along with 'application-name', 'tag', and timestamp
    insert_metric_sql = "INSERT INTO log_history (log, status, finish_reason, application_name, app_user, app_id, timestamp) VALUES (%s, %s, %s, %s, %s, %s, %s)"
    cursor.execute(
        insert_metric_sql, 
        (
            json.dumps(json_object),                               # Log is being inserted as a JSON object
            status,                                                # Assuming 'status' is defined elsewhere
            finish_reason,                                         # Assuming 'finish_reason' is defined elsewhere
            json_object.get("application-name", None),             # Handling "application_name"
            json_object.get("app-user", None),                     # Handling "app_user"
            json_object.get("application-name", None),             # Assuming "application-name" is also used as "app_id"
            current_timestamp                                      # Ensure current_timestamp is defined
        )
    )
    conn.commit()
    cursor.close()
    conn.close()

def process_graphsignallogs(message,conn,json_object):
    print(json_object)
    cursor = conn.cursor()
    # Create a table if it does not exist
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS log_history (
            id SERIAL PRIMARY KEY,
            log JSONB NULL,
            status TEXT NULL,
            finish_reason TEXT NULL, 
            application_name TEXT,
            app_user TEXT,
            app_id TEXT UNIQUE,
            timestamp TIMESTAMP
    )
    """
    cursor.execute(create_table_sql)

    # Get the current timestamp
    current_timestamp = datetime.datetime.now()
    logs = json_object.get("logs", None)
    if logs is None:
        return 
    
    findupload = False
    status = "success"
    print("inside process_graphsignallogs")
    for log in logs:
        if "message" in log and "Upload" in log["message"]:
            print("findupload=True")
            findupload = True

        if "level" in log and log["level"] == "ERROR" and message in log and "exception" in log["message"]:
            status = "user_abandoned"
    
    if status == "success" and findupload == False:
        status = "incomplete"
        print("status=incomplete")

    if status != "success":
        print("in process_graphsignallogs: status: ", status)
        select_query = "SELECT 1 FROM log_history WHERE app_id = %s LIMIT 1;"
        cursor.execute(select_query, (json_object.get("application-name", "invalid"),))
        entry_exists = cursor.fetchone()
        print("entry_exists: ", entry_exists)
        if entry_exists:
            # Entry exists, update the status field
            update_query = """
                UPDATE log_history
                SET status = %s, timestamp = %s
                WHERE app_id = %s
            """
            cursor.execute(update_query, (status, current_timestamp, (json_object.get("application-name", "invalid"))))
            print("entry_exists executed: ", update_query)
            #print(f"Entry with app_id {(json_object.get("application-name", "invalid")} has been updated.")
        else:
            # SQL command to insert the JSON data along with 'application-name', 'tag', and timestamp
            insert_metric_sql = "INSERT INTO log_history (log, status, application_name, app_user, app_id, timestamp) VALUES (%s, %s, %s, %s, %s, %s, %s)"
            cursor.execute(
                insert_metric_sql, 
                (
                    json.dumps(json_object),                               # Log is being inserted as a JSON object
                    status,                                                # Assuming 'status' is defined elsewhere
                    json_object.get("application-name", None),             # Handling "application_name"
                    json_object.get("app-user", None),                     # Handling "app_user"
                    json_object.get("application-name", None),             # Assuming "application-name" is also used as "app_id"
                    current_timestamp                                      # Ensure current_timestamp is defined
                )
            )
            print("insert_metric_sql: ", insert_metric_sql)
    conn.commit()
    cursor.close()
    conn.close()

def process_metrics(message,conn,json_object):
    
    cursor = conn.cursor()
    #json_object = json_object["metrics"]
    # Create a table if it does not exist
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS system (
            id SERIAL PRIMARY KEY,
            process_cpu_usage JSONB NULL,
            process_memory JSONB NULL,
            virtual_memory JSONB NULL,
            node_memory_used JSONB NULL,
            application_name TEXT,
            app_user TEXT,
            app_id TEXT UNIQUE,
            timestamp TIMESTAMP
    )
    """
    cursor.execute(create_table_sql)

    # Get the current timestamp
    current_timestamp = datetime.datetime.now()

    def get_system_objects(data_obj):
        json_new = {}

        if isinstance(data_obj, list):
            for item in data_obj:
                if "scope" in item and item["scope"] == "system" and "name" in item:
                    json_new[item["name"]] = item
        return json_new
    
    json_system_objects = get_system_objects(json_object["metrics"])
    print(type(json_system_objects), type(json_object))

    # SQL command to insert the JSON data along with 'application-name', 'tag', and timestamp
    insert_metric_sql = "INSERT INTO system (process_cpu_usage, process_memory, virtual_memory, node_memory_used, application_name, app_user, app_id, timestamp) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
    cursor.execute(
        insert_metric_sql, 
        (
            json.dumps(json_system_objects.get("process_cpu_usage", None)),
            json.dumps(json_system_objects.get("process_memory", None)),
            json.dumps(json_system_objects.get("virtual_memory", None)),
            json.dumps(json_system_objects.get("node_memory_used", None)),
            json_object.get("application-name", None),
            json_object.get("app-user", None),
            json_object.get("application-name", None),  # Assuming you want to use "application-name" as "app_id"
            current_timestamp  # Make sure current_timestamp is defined
        )
    )
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS token_usage (
            id SERIAL PRIMARY KEY,
            usage JSONB NULL,
            token_cost NUMERIC(10,10) NULL,
            application_name TEXT,
            app_user TEXT,
            app_id TEXT UNIQUE,
            timestamp TIMESTAMP
    )
    """
    cursor.execute(create_table_sql)

    def get_usage_objects(data_obj):
        json_new = {"data":[]}
        print("get usage objects")
        if isinstance(data_obj, list):
            for item in data_obj:
                if "scope" in item and item["scope"] == "usage" and "name" in item:
                    json_new["data"].append(item)
        return json_new


    def calculate_token_cost(data_obj): 
        total_tokens = 0
        data_obj = data_obj["data"]
        if isinstance(data_obj, list):
            for item in data_obj:
                if "scope" in item and item["scope"] == "usage" and "name" in item and item["name"]=="token_count" and "counter" in item:
                    total_tokens += item["counter"]

        print("total_tokens: ", total_tokens)
        return calculate_openai_cost(total_tokens)

    json_usage_objects = get_usage_objects(json_object["metrics"])

    token_cost = calculate_token_cost(json_usage_objects)

    # SQL command to insert the JSON data along with 'application-name', 'tag', and timestamp
    insert_metric_sql = "INSERT INTO token_usage (usage, token_cost, application_name, app_user, app_id, timestamp) VALUES (%s, %s, %s, %s, %s, %s)"
    cursor.execute(
        insert_metric_sql, 
        (
            json.dumps(json_usage_objects),                       # Log the usage as a JSON object
            token_cost,                                           # Assuming 'token_cost' is defined elsewhere
            json_object.get("application-name", None),            # Handling "application_name"
            json_object.get("app-user", None),                    # Handling "app_user"
            json_object.get("application-name", None),            # Assuming "application-name" is also used as "app_id"
            current_timestamp                                     # Ensure current_timestamp is defined
        )
    )
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS performance (
            id SERIAL PRIMARY KEY,
            data JSONB NULL,
            application_name TEXT,
            app_user TEXT,
            app_id TEXT UNIQUE,
            timestamp TIMESTAMP
    )
    """
    cursor.execute(create_table_sql)
   
    def get_performance_objects(data_obj):
        json_new = {}

        if isinstance(data_obj, list):
            for item in data_obj:
                if "scope" in item and item["scope"] == "performance" and "name" in item:
                    json_new[item["name"]] = item
        return json_new

    json_performance_objects = get_performance_objects(json_object["metrics"])    

    insert_metric_sql = "INSERT INTO performance (data, application_name, app_user, app_id, timestamp) VALUES (%s, %s, %s, %s, %s)"
    cursor.execute(
        insert_metric_sql, 
        (
            json.dumps(json_performance_objects),                 # Log the performance data as a JSON object
            json_object.get("application-name", None),            # Handling "application_name"
            json_object.get("app-user", None),                    # Handling "app_user"
            json_object.get("application-name", None),            # Assuming "application-name" is also used as "app_id"
            current_timestamp                                     # Ensure current_timestamp is defined
        )
    )
    conn.commit()
    cursor.close()
    conn.close()

def process_spans(message,conn,json_object):
    cursor = conn.cursor()
    #json_object = json_object["spans"]
    print("in process_spans")
    # Create a table if it does not exist
    '''create_table_sql = """
    CREATE TABLE IF NOT EXISTS maintenance (
            id SERIAL PRIMARY KEY,
            config JSONB NULL,
            application_name TEXT,
            app_user TEXT,
            app_id TEXT UNIQUE,
            timestamp TIMESTAMP
    )
    """
    '''
    
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS maintenance (
            id SERIAL PRIMARY KEY,
            graphsignal_library_version TEXT NULL,
            os_name TEXT NULL,
            os_version TEXT NULL,
            runtime_name TEXT NULL,
            runtime_version TEXT NULL,
            openai_library_version TEXT NULL,
            langchain_library_version TEXT NULL,
            hostname TEXT NULL, 
            application_name TEXT,
            app_user TEXT,
            app_id TEXT UNIQUE,
            timestamp TIMESTAMP
    )
    """
    cursor.execute(create_table_sql)

    # Get the current timestamp
    current_timestamp = datetime.datetime.now()

    json_span_first_object = json_object["spans"][0]

    def extract_config(obj):
        dct = {}
        for item in obj:
            if "key" in item:
                key = item["key"]
                dct[key] = item["value"]
        return dct

    config_dict = extract_config(json_span_first_object["config"])

    # SQL command to insert the JSON data along with 'application-name', 'tag', and timestamp
    insert_metric_sql = "INSERT INTO maintenance (graphsignal_library_version, os_name, os_version, runtime_name, runtime_version, openai_library_version, langchain_library_version, hostname, application_name, app_user, app_id, timestamp) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
    cursor.execute(
        insert_metric_sql, 
        (
            config_dict.get("graphsignal.library.version", None),   # Handle "graphsignal.library.version"
            config_dict.get("os.name", None),                       # Handle "os.name"
            config_dict.get("os.version", None),                    # Handle "os.version"
            config_dict.get("runtime.name", None),                  # Handle "runtime.name"
            config_dict.get("runtime.version", None),               # Handle "runtime.version"
            config_dict.get("openai.library.version", None),        # Handle "openai.library.version"
            config_dict.get("langchain.library.version", None),     # Handle "langchain.library.version"
            socket.gethostname(),                                   # Get the hostname
            json_object.get("application-name", None),              # Handle "application-name"
            json_object.get("app-user", None),                      # Handle "app_user"
            json_object.get("application-name", None),              # Handle "app_id" (using the same as "application-name")
            current_timestamp                                       # Ensure current_timestamp is defined
        )
    )    
    # operations
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS operations (
            id SERIAL PRIMARY KEY,
            span_id TEXT NULL,
            operation TEXT NULL,
            exceptions JSONB NULL,
            usage JSONB NULL,
            config JSONB NULL,
            payloads JSONB NULL,
            tags JSONB NULL,
            start_us BIGINT NULL,
            end_us BIGINT NULL,
            latency_ns BIGINT NULL,
            application_name TEXT,
            app_user TEXT,
            app_id TEXT,
            timestamp TIMESTAMP
    )
    """
    cursor.execute(create_table_sql)
    status = "success"
    for span in json_object["spans"]:
        start_us = span.get("start_us", 0)
        end_us = span.get("end_us", 0)
        latency_ns = span.get("latency_ns", 0)
        if "tags" in span:
            for tag in span["tags"]:
                if "key" in tag and tag["key"] == "operation":
                    op = tag["value"]

                    insert_metric_sql = "INSERT INTO operations (span_id, operation, exceptions, usage, config, payloads, tags, start_us, end_us, latency_ns, application_name, app_user, app_id, timestamp) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
                    exceptions = span.get("exceptions", [])
                    cursor.execute(
                        insert_metric_sql, 
                        (
                            json.dumps(span.get("span_id", None)),         # Handle "span_id"
                            op,                                            # Operation (assuming 'op' is defined)
                            json.dumps(exceptions),      # Handle "exceptions"
                            json.dumps(span.get("usage", None)),           # Handle "usage"
                            json.dumps(span.get("config", None)),          # Handle "config"
                            json.dumps(span.get("payloads", None)),        # Handle "payloads"
                            json.dumps(span.get("tags", None)),            # Handle "tags"
                            start_us,                                      # Start timestamp in microseconds (assuming 'start_us' is defined)
                            end_us,                                        # End timestamp in microseconds (assuming 'end_us' is defined)
                            latency_ns,                                    # Latency in nanoseconds (assuming 'latency_ns' is defined)
                            json_object.get("application-name", None),     # Handle "application-name"
                            json_object.get("app-user", None),             # Handle "app-user"
                            json_object.get("application-name", None),     # Handle "app_id" (using the same as "application-name")
                            current_timestamp                              # Ensure current_timestamp is defined
                        )
                    )
                    if len(exceptions) > 0:
                        status = "failure"

    
    
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS log_history (
            id SERIAL PRIMARY KEY,
            log JSONB NULL,
            status TEXT NULL,
            finish_reason TEXT NULL, 
            application_name TEXT,
            app_user TEXT,
            app_id TEXT UNIQUE,
            timestamp TIMESTAMP
    )
    """
    cursor.execute(create_table_sql)
    
    select_query = "SELECT 1 FROM log_history WHERE app_id = %s LIMIT 1;"
    cursor.execute(select_query, (json_object.get("application-name", "invalid"),))
    print("in process_spans: status: ", status)
    insert_metric_sql = "INSERT INTO log_history (log, status, application_name, app_user, app_id, timestamp) VALUES (%s, %s, %s, %s, %s, %s)"
    cursor.execute(
        insert_metric_sql, 
        (
            json.dumps(json_object),                               # Log is being inserted as a JSON object
            status,                                                # Assuming 'status' is defined elsewhere
            json_object.get("application-name", None),             # Handling "application_name"
            json_object.get("app-user", None),                     # Handling "app_user"
            json_object.get("application-name", None),             # Assuming "application-name" is also used as "app_id"
            current_timestamp                                      # Ensure current_timestamp is defined
        )
    )

    create_table_sql = """
    CREATE TABLE IF NOT EXISTS auditing (
            id SERIAL PRIMARY KEY,
            flagged BOOLEAN NULL,
            categories JSONB NULL,
            category_scores JSONB NULL,
            application_name TEXT,
            app_user TEXT,
            app_id TEXT UNIQUE,
            timestamp TIMESTAMP
    )
    """
    cursor.execute(create_table_sql)
    print("tahsin testing calculate_safety_score")
    calculate_safety_score(json_object.get("app-user", None),json_object.get("application-name", None),"what is the longest beach in the world?")
    print("tahsin done testing calculate_safety_score")

    # code to query moderation api
    auditing_json = None
    if "payloads" in json_span_first_object:
        print("inside payloads")
        for payload in json_span_first_object["payloads"]:
            print("inside first_span")
            if "name" in payload and payload["name"] == "input":
                print("tahsin inside input")
                input = json.dumps(payload.get("content_base64", None))
                decoded_bytes = base64.b64decode(input)
                decoded_str = decoded_bytes.decode('utf-8')
                auditing_json = calculate_safety_score(json_object.get("app-user", None),json_object.get("application-name", None),decoded_str)

                            # SQL command to insert the JSON data along with 'application-name', 'tag', and timestamp
    insert_metric_sql = "INSERT INTO auditing (flagged, categories, category_scores, application_name, app_user, app_id, timestamp) VALUES (%s, %s, %s, %s, %s, %s, %s)"
    cursor.execute(
    insert_metric_sql, 
        (
        json.dumps(auditing_json.get("flagged", None)),           # Handle "flagged"
        json.dumps(auditing_json.get("categories", None)),        # Handle "categories"
        json.dumps(auditing_json.get("category_scores", None)),   # Handle "category_scores"
        auditing_json.get("application-name", None),              # Handle "application-name"
        auditing_json.get("app-user", None),                      # Handle "app-user"
        auditing_json.get("application-name", None),              # Handle "app_id" (same as "application-name")
        current_timestamp                                       # Ensure current_timestamp is defined
        )
    )


    conn.commit()
    cursor.close()
    conn.close()

##### AUDITING
OPENAI_API_KEY = "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"

def get_moderation_response(data, url):
    # Make the POST request
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_API_KEY}"
    }
    response = requests.post(url, headers=headers, json=data)

    json_obj = None
    # Check if the request was successful (status code 200)
    if response.status_code == 200:
        print("Moderation successful.")
        print("Response:")
        print(response.json())
        json_obj = response.json()
    else:
        print("Moderation failed. Status code:", response.status_code)
    return json_obj

def parse_moderation_response(json_obj):
    if json_obj is None:
        return None
    
    if 'results' not in json_obj or len(json_obj['results']) == 0:
        return None
    
    return json_obj['results'][0]

def calculate_safety_score(user, app_name, question):
    # Define the data payload
    print("calling calculate_safety_score")
    result_info = {}
    if question is not None:
        data = {
            "input": question
        }
        response_json = get_moderation_response(data, "https://api.openai.com/v1/moderations")
        result_info = parse_moderation_response(response_json)
    result_info["kafka-topic"] = "auditing"
    result_info["app-user"] = user
    result_info["application-name"] = app_name

    if question is None:
        result_info["flagged"] = False
    return result_info

'''
def process_auditing_message(message,conn,json_object):
    cursor = conn.cursor()
    # Create a table if it does not exist
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS auditing (
            id SERIAL PRIMARY KEY,
            flagged BOOLEAN NULL,
            categories JSONB NULL,
            category_scores JSONB NULL,
            application_name TEXT,
            app_user TEXT,
            app_id TEXT UNIQUE,
            timestamp TIMESTAMP
    )
    """
    cursor.execute(create_table_sql)

    # Get the current timestamp
    current_timestamp = datetime.datetime.now()

    #print(json_object)

    # SQL command to insert the JSON data along with 'application-name', 'tag', and timestamp
    insert_metric_sql = "INSERT INTO auditing (flagged, categories, category_scores, application_name, app_user, app_id, timestamp) VALUES (%s, %s, %s, %s, %s, %s, %s)"
    cursor.execute(
        insert_metric_sql, 
        (
            json.dumps(json_object.get("flagged", None)),           # Handle "flagged"
            json.dumps(json_object.get("categories", None)),        # Handle "categories"
            json.dumps(json_object.get("category_scores", None)),   # Handle "category_scores"
            json_object.get("application-name", None),              # Handle "application-name"
            json_object.get("app-user", None),                      # Handle "app-user"
            json_object.get("application-name", None),              # Handle "app_id" (same as "application-name")
            current_timestamp                                       # Ensure current_timestamp is defined
        )
    )
    conn.commit()
    cursor.close()
    conn.close()
'''
def create_db_connection():
    try:
        # Get database connection parameters from environment variables
        
        DB_NAME=os.getenv('DB_NAME')
        DB_USER=os.getenv('DB_USER')
        DB_PASSWORD=os.getenv('DB_PASSWORD')
        DB_HOST=os.getenv('DB_HOST')
        DB_PORT=os.getenv('DB_PORT')
        print(DB_NAME, DB_USER, DB_PASSWORD, DB_HOST)
        # Establish the database connection
        connection = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST
        )

        return connection

    except psycopg2.Error as e:
        print("Error connecting to the database:", e)
        return None
