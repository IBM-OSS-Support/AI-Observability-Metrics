#!/bin/bash

export REACT_APP_BACKEND_API_URL="http://$HOST_IP_FOR_API_SERVER:$SERVER_PORT/data"
# Start PostgreSQL
service postgresql start

#start flaskapp
cd /app/applications/flask_server  && flask run --host=0.0.0.0 --port=$FLASK_PORT &
# Start WebSocket server
cd /app/websocket-server && node server.js &

#start client-app
cd /app/client-app && npm start & 
python3 /app/applications/random_app.py
#
sleep infinity

