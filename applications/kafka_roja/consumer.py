from kafka import KafkaProducer
from kafka import KafkaConsumer
from kafka.errors import KafkaError
import datetime
import logging
import os
import psycopg2
import json

kafka_server = 'localhost:9092'

# Set up basic logging
logging.basicConfig(level=logging.CRITICAL)

def kafka_subscribe(consumer):

    # Subscribe to multiple topics
    topics = ['auditing', 'log_history', 'maintenance', 'session_info']
    consumer.subscribe(topics)

    # Start consuming messages
    for message in consumer:
        print("Received message from topic", message.topic, ":", message.value)
        upload_to_postgres(message)

def upload_to_postgres(message):
    print("Inside upload_to_postgres: ", message.topic, ":", message.value)
    json_data = message.value
    json_object = json.loads(json_data)
    json_object_sanitized = json.dumps(json_object, default=lambda x: None if isinstance(x, float) and (x == float('inf') or x == float('-inf') or x != x) else x)
    json_object = json.loads(json_object_sanitized)

    conn = create_db_connection()
    cursor = conn.cursor()
    # Create a table if it does not exist
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS signals (
            id SERIAL PRIMARY KEY,
            signal TEXT,
            data JSONB,
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
    insert_metric_sql = "INSERT INTO signals (signal, data, application_name, app_user, timestamp) VALUES (%s, %s, %s, %s, %s)"
    cursor.execute(insert_metric_sql, (message.topic, json_data, json_object["application_name"], json_object["app_user"], current_timestamp))

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
    

def create_kafka_consumer():
    logging.debug("create kafka consumer")
    try:
        consumer = KafkaConsumer(
            bootstrap_servers=kafka_server,
            group_id='my_consumer_group',  # Specify a consumer group
            auto_offset_reset='earliest',  # Start consuming from the earliest available message
            enable_auto_commit=True,  # Automatically commit offsets
            auto_commit_interval_ms=1000,  # Auto commit offsets every 1 second
            value_deserializer=lambda x: x.decode('utf-8')  # Deserialize message values as UTF-8 strings
    )

    except KeyboardInterrupt:
        print("KeyboardInterrupt detected. Exiting...")
    except KafkaError as kafka_error:
        print("Error while consuming messages:", kafka_error)
    except Exception as e:
        print("An unexpected error occurred:", e)

    return consumer


def posgres_log_history_insert(message):
    print("Inside posgres_log_history_insert: ", message.topic, ":", message.value)

def posgres_auditing_insert(message):
    print("Inside posgres_auditing_insert: ", message.topic, ":", message.value)

def upload_to_db_specific_tables(message):
    topic = message.topic
    topic_to_function = {
        "auditing": posgres_auditing_insert,
        "log_history": posgres_log_history_insert
    }

    if topic in topic_to_function:
        # Call the function with the message
        topic_to_function[topic](message)
    else:
        print("No function defined for topic:", topic)
    '''
    json_data = message.value
    conn = create_db_connection()
    cursor = conn.cursor()
    # Create a table if it does not exist
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS safety (
            id SERIAL PRIMARY KEY,
            data JSONB,
            application_name TEXT,
            timestamp TIMESTAMP,
            CONSTRAINT unique_tag_application_name UNIQUE (application_name)
    )
    """
    cursor.execute(create_table_sql)
        
        # Get the current timestamp
    current_timestamp = datetime.datetime.now()

        # SQL command to insert the JSON data along with 'application-name', 'tag', and timestamp
    insert_metric_sql = "INSERT INTO signals (data, application_name, timestamp) VALUES (%s, %s, %s) ON CONFLICT ON CONSTRAINT unique_tag_application_name DO UPDATE SET data = %s, timestamp = %s"

    cursor.execute(insert_metric_sql, (json_data, signal_dict.get('application-name', None), current_timestamp, json_data, current_timestamp))

    conn.commit()
    cursor.close()
    conn.close()
    '''

if __name__ == "__main__":
    consumer = create_kafka_consumer()
    kafka_subscribe(consumer)



