# roja-metric-poc

## Create a graphsignal api by signing up at https://app.graphsignal.com/signup FREE

## GET A PAID OPENAI_API_KEY FROM IBM PM

### INSTALL THE REQUIREMENTS

```shell
cd server
pip3 install -r requirements.txt
```

## RUN Kafka Consumer

```shell
cd applications/kafka_roja/
python3 consumer.py
```

## RUN Flask app

```shell
cd applications/flask_server/
python3 flask_app.py
```

## RUN application

```shell
cd applications/
python3 bhoomaiah_app.py
```

### Start the dockerfiles

```shell
./start.sh
```