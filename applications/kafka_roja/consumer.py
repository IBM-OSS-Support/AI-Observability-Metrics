from kafka import KafkaProducer
from kafka import KafkaConsumer
from kafka.errors import KafkaError
import datetime
import logging
import os
import psycopg2
import json
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from postgres import postgres


kafka_server = os.getenv('KAFKA_URL')

# Set up basic logging
logging.basicConfig(level=logging.DEBUG)

def kafka_subscribe(consumer):

    print("running")
    if consumer is None:
        sys.exit("Kafka consumer not initialized properly. Return and exit.")
    # Subscribe to multiple topics
    topics = ['auditing','spans','metrics','log_history','session_info','embedding','user_satisfaction','accuracy', 'anthropic_metrics']
    consumer.subscribe(topics)

    # Start consuming messages
    try:
        for message in consumer:
            print("Received message from topic", message.topic, ":", message.value)
            postgres.upload_to_postgres(message)
    finally:
        consumer.close()

def create_kafka_consumer():
    logging.debug("create kafka consumer")
    consumer = None
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

if __name__ == "__main__":
    consumer = create_kafka_consumer()
    kafka_subscribe(consumer)



