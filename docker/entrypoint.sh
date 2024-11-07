#!/bin/bash
# Start PostgreSQL
service postgresql start
#start flaskapp
cd /app/applications/flask_server  && flask run --host=0.0.0.0 --port=$FLASK_PORT &
# Start WebSocket server
cd /app/websocket-server && node server.js &
#start client-app
cd /app/client-app && npm start  
sleep infinity
