import datetime
import logging
import os
import psycopg2
import json
import time

# Set up basic logging
logging.basicConfig(level=logging.CRITICAL)

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
        'auditing': process_auditing_message,
        'spans': process_spans,
        'metrics': process_metrics,
        'log_history': process_log_history,
        'session_info':process_session_info,
        'embedding':process_embedding    
    }

    processing_function = topic_processing_functions[message.topic]
    processing_function(message,conn,json_object)

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

    print(json_object)

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

    print(json_object)

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
            log JSONB,
            status TEXT,
            finish_reason TEXT, 
            application_name TEXT,
            app_user TEXT,
            timestamp TIMESTAMP
    )
    """
    cursor.execute(create_table_sql)

    # Get the current timestamp
    current_timestamp = datetime.datetime.now()

    print(json_object)

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
    '''
    if status == "success":
        if completion_status == "failure":
            status = "failure"
        else:
            status = "success"
    '''
    print(type(status), type(finish_reason))
    # SQL command to insert the JSON data along with 'application-name', 'tag', and timestamp
    insert_metric_sql = "INSERT INTO log_history (log, status, finish_reason, application_name, app_user, timestamp) VALUES (%s, %s, %s, %s, %s, %s)"
    cursor.execute(insert_metric_sql, (json.dumps(json_object), status, finish_reason, json_object["application-name"], json_object["app-user"], current_timestamp))

    conn.commit()
    cursor.close()
    conn.close()

def process_metrics(message,conn,json_object):
    
    cursor = conn.cursor()
    print("----------tahsin metrics-----------------------------------------: ")
    #json_object = json_object["metrics"]
    # Create a table if it does not exist
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS system (
            id SERIAL PRIMARY KEY,
            process_cpu_usage JSONB,
            process_memory JSONB,
            virtual_memory JSONB,
            node_memory_used JSONB,
            application_name TEXT,
            app_user TEXT,
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
    print(json_system_objects, json_object)

    # SQL command to insert the JSON data along with 'application-name', 'tag', and timestamp
    insert_metric_sql = "INSERT INTO system (process_cpu_usage, process_memory, virtual_memory, node_memory_used, application_name, app_user, timestamp) VALUES (%s, %s, %s, %s, %s, %s, %s)"
    cursor.execute(insert_metric_sql, (json.dumps(json_system_objects["process_cpu_usage"]), json.dumps(json_system_objects["process_memory"]), json.dumps(json_system_objects["virtual_memory"]), json.dumps(json_system_objects["node_memory_used"]), json_object["application-name"], json_object["app-user"], current_timestamp))

    create_table_sql = """
    CREATE TABLE IF NOT EXISTS token_usage (
            id SERIAL PRIMARY KEY,
            usage JSONB,
            token_cost NUMERIC(10,10),
            application_name TEXT,
            app_user TEXT,
            timestamp TIMESTAMP
    )
    """
    cursor.execute(create_table_sql)

    def get_usage_objects(data_obj):
        json_new = {"data":[]}
        print("get usage objects")
        #time.sleep(5)
        if isinstance(data_obj, list):
            #print("yes is instance")
            #time.sleep(5)
            for item in data_obj:
                if "scope" in item and item["scope"] == "usage" and "name" in item:
                    #print("got one")
                    json_new["data"].append(item)
                    #time.sleep(5)
        print(json_new)
        return json_new


    def calculate_token_cost(data_obj): 
        total_tokens = 0
        data_obj = data_obj["data"]
        if isinstance(data_obj, list):
            for item in data_obj:
                if "scope" in item and item["scope"] == "usage" and "name" in item and item["name"]=="token_count" and "counter" in item:
                    total_tokens += item["counter"]

        print("total_tokens: ", total_tokens)
        #time.sleep(5)
        return calculate_openai_cost(total_tokens)

    json_usage_objects = get_usage_objects(json_object["metrics"])

    token_cost = calculate_token_cost(json_usage_objects)

    #print(json_token_objects)
    # SQL command to insert the JSON data along with 'application-name', 'tag', and timestamp
    insert_metric_sql = "INSERT INTO token_usage (usage, token_cost, application_name, app_user, timestamp) VALUES (%s, %s, %s, %s, %s)"
    cursor.execute(insert_metric_sql, (json.dumps(json_usage_objects), token_cost, json_object["application-name"], json_object["app-user"], current_timestamp))

    create_table_sql = """
    CREATE TABLE IF NOT EXISTS performance (
            id SERIAL PRIMARY KEY,
            data JSONB,
            application_name TEXT,
            app_user TEXT,
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

    insert_metric_sql = "INSERT INTO performance (data, application_name, app_user, timestamp) VALUES (%s, %s, %s, %s)"
    cursor.execute(insert_metric_sql, (json.dumps(json_performance_objects), json_object["application-name"], json_object["app-user"], current_timestamp))

    conn.commit()
    cursor.close()
    conn.close()

def process_spans(message,conn,json_object):
    cursor = conn.cursor()
    #json_object = json_object["spans"]
    print("in process_spans")
    # Create a table if it does not exist
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS maintenance (
            id SERIAL PRIMARY KEY,
            config JSONB,
            application_name TEXT,
            app_user TEXT,
            timestamp TIMESTAMP
    )
    """
    cursor.execute(create_table_sql)

    # Get the current timestamp
    current_timestamp = datetime.datetime.now()

    print(json_object)
    json_span_first_object = json_object["spans"][0]

    # SQL command to insert the JSON data along with 'application-name', 'tag', and timestamp
    insert_metric_sql = "INSERT INTO maintenance (config, application_name, app_user, timestamp) VALUES (%s, %s, %s, %s)"
    cursor.execute(insert_metric_sql, (json.dumps(json_span_first_object["config"]), json_object["application-name"], json_object["app-user"], current_timestamp))
    #cursor.execute(insert_metric_sql, (json.dumps(json_object["application-name"]), json_object["application-name"], json_object["app-user"], current_timestamp))

    # operations
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS operations (
            id SERIAL PRIMARY KEY,
            span_id TEXT,
            operation TEXT,
            exceptions JSONB,
            usage JSONB,
            config JSONB,
            tags JSONB,
            application_name TEXT,
            app_user TEXT,
            timestamp TIMESTAMP
    )
    """
    cursor.execute(create_table_sql)
    print("spans")
    for span in json_object["spans"]:
        if "tags" in span:
            for tag in span["tags"]:
                if "key" in tag and tag["key"] == "operation":
                    op = tag["value"]

                    insert_metric_sql = "INSERT INTO operations (span_id, operation, exceptions, usage, config, tags, application_name, app_user, timestamp) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
                    cursor.execute(insert_metric_sql, (json.dumps(span["span_id"]), op, json.dumps(span["exceptions"]), json.dumps(span["usage"]), json.dumps(span["config"]), json.dumps(span["tags"]), json_object["application-name"], json_object["app-user"], current_timestamp))

    conn.commit()
    cursor.close()
    conn.close()

def process_auditing_message(message,conn,json_object):
    cursor = conn.cursor()
    # Create a table if it does not exist
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS auditing (
            id SERIAL PRIMARY KEY,
            flagged BOOLEAN,
            categories JSONB,
            category_scores JSONB,
            application_name TEXT,
            app_user TEXT,
            timestamp TIMESTAMP
    )
    """
    cursor.execute(create_table_sql)

    # Get the current timestamp
    current_timestamp = datetime.datetime.now()

    print(json_object)

    # SQL command to insert the JSON data along with 'application-name', 'tag', and timestamp
    insert_metric_sql = "INSERT INTO auditing (flagged, categories, category_scores, application_name, app_user, timestamp) VALUES (%s, %s, %s, %s, %s, %s)"
    cursor.execute(insert_metric_sql, (json.dumps(json_object["flagged"]), json.dumps(json_object["categories"]), json.dumps(json_object["category_scores"]), json_object["application-name"], json_object["app-user"], current_timestamp))

    conn.commit()
    cursor.close()
    conn.close()

def create_db_connection():
    try:
        # Get database connection parameters from environment variables
        
        DB_NAME="roja_postgres"
# DB_NAME=roja_dev # dev 
        DB_USER="roja_user"
        DB_PASSWORD="roja_user"
        DB_HOST="9.20.196.69"
        DB_PORT=5432
        #DB_NAME = os.environ.get("DB_NAME")
        #DB_USER = os.environ.get("DB_USER")
        #DB_PASSWORD = os.environ.get("DB_PASSWORD")
        #DB_HOST = os.environ.get("DB_HOST")
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