from kafka import KafkaProducer, KafkaConsumer
import logging
import json

url = 'http://localhost:5000/receive_json'
kafka_server = 'localhost:9092'
producer = KafkaProducer(bootstrap_servers=kafka_server)

# Set up basic logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger()

def kafka_producer(json_data):
    topic = json_data["kafka_topic"]
    print(type(topic), type(json_data))
    if topic:
        json_bytes = json.dumps(json_data).encode('utf-8')
        producer.send(topic, json_bytes)
        logger.debug("Successfully send topic: ", topic, ", json: ", json_data)
    else:
        logger.error("Failed to send topic: ", topic, ", json: ", json_data)
