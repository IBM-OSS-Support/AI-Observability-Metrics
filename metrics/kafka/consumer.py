from kafka import KafkaConsumer

# Create Kafka consumer
consumer = KafkaConsumer(
    bootstrap_servers='localhost:9092',
    group_id='my_consumer_group',  # Specify a consumer group
    auto_offset_reset='earliest',  # Start consuming from the earliest available message
    enable_auto_commit=True,  # Automatically commit offsets
    auto_commit_interval_ms=1000,  # Auto commit offsets every 1 second
    value_deserializer=lambda x: x.decode('utf-8')  # Deserialize message values as UTF-8 strings
)

# Subscribe to multiple topics
topics = ['auditing', 'log_history', 'maintenance', 'session_info']
consumer.subscribe(topics)

# Start consuming messages
for message in consumer:
    print("Received message from topic", message.topic, ":", message.value)

