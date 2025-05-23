from kafka import KafkaProducer, KafkaConsumer
import logging
import json
import os

kafka_server = os.getenv('KAFKA_URL')
producer = KafkaProducer(bootstrap_servers=kafka_server)

# Set up basic logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger()

def extract_topic(json_data):
    if "kafka-topic" in json_data:
        return json_data["kafka-topic"]
    else:
        logger.error("Unknown topic sent: ", json_data)
        return "None"

def kafka_producer(json_data):
    
    topic = extract_topic(json_data)
    print(type(topic), type(json_data))
    if topic:
        json_bytes = json.dumps(json_data).encode('utf-8')
        future = producer.send(topic, json_bytes)
        result = future.get(timeout=60)
        logger.debug("Successfully send topic: ", topic, ", json: ", json_data)
    else:
        logger.error("Failed to send topic: ", topic, ", json: ", json_data)
