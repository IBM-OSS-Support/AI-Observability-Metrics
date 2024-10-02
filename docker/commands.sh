#!/bin/bash

echo $REACT_APP_BACKEND_API_URL
echo $FLASK_SERVER_URL
echo $API_URL


export REACT_APP_BACKEND_API_URL="http://$HOST_IP:5000/data"
echo "Backend API URL set to: $REACT_APP_BACKEND_API_URL"

# Start PostgreSQL
service postgresql start

#start flaskapp
cd /app/applications/flask_server  && flask run --host=0.0.0.0 --port=3001 &
#FLASK_SERVER_URL="http://127.0.0.1:3001" python3 /app/applications/flask_server/flask_app.py &

# Start WebSocket server
cd /app/websocket-server && node server.js &

#start client-app
cd /app/client-app && npm start & 



#GRAPHSIGNAL_API_KEY="7e6ff4494810b4cb37255d369cfae983" OPENAI_API_KEY="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" API_URL="http://localhost:3001" FLASK_SERVER_URL="http://127.0.0.1:3001" OPENAI_ORG_ID="org-zvKGqHl0adRlJbe7lpb7n1wX" python3 /app/applications/bhoomaiah_app.py 
python3 /app/applications/random_app.py
#
sleep infinity

