# roja-metric-poc

## CREATE PY ENV

```shell
python3 -m venv roja-metric-env
```

## ACTIVATE ENV

```shell
source roja-metric-env/bin/activate
```

## deactivate the env

```shell
deactivate
```

## Create a graphsignal api by signing up at https://app.graphsignal.com/signup FREE

## GET A PAID OPENAI_API_KEY FROM IBM PM

## START THE FLASK APP

### INSTALL THE REQUIREMENTS

```shell
cd server
pip3 install -r requirements.txt
```

### RUN THE FLASK APPLICATION
```
cd server/GraphsignalFlaskProject
python3 app.py
```

### RUN THE SAMPLE PROGRAM
```
cd server/
pip3 install langchain
pip install openai
pip install numexpr
python3 sample.py
```

### To decompress
```
gzip -d -S .gzip dummy_new_9.gzip
```