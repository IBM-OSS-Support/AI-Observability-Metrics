from kafka import KafkaProducer
from flask import Flask, request, jsonify

app = Flask(__name__)
producer = KafkaProducer(bootstrap_servers='localhost:9092')

@app.route('/send', methods=['POST'])
def send_message():
    try:
        json_data = request.json
        topic = json_data["kafka_topic"]
        if topic:
            producer.send(topic, value=json_data)
            return jsonify({"status": "success", "message": "Message sent to Kafka topic: {}".format(topic)})
        else:
            return jsonify({"status": "error", "message": "No appropriate topic found for the given JSON data"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
