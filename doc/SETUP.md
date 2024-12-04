
## Section 1: Setup
### Option A: Execute Docker Image
1. Navigate to directory
```bash
  $ cd AI-Observability-Metrics/
```

2. Execute the following command:
```bash
  $ docker build -t ai_observability_metrics -f docker/dockerfile .
```

3. Run the docker image:
```bash
  $ docker run --name ai-observability-metrics -itd --memory="2g" --restart unless-stopped -p 5432:5432 -p 15000:15000 -p 12000:12000 -p 3000:3000 ai_observability_metrics:latest
```

4. Follow Section 2 on steps to run the application

## Option B: Execute individual applications separately

### RUN Flask Application
1. Change to directory
```bash
  $ cd AI-Observability-Metrics/applications/flask_server
```
2. Export the following variables 

```bash
  export FLASK_PORT=12000
  export POSTGRES_PORT=5432

  export DB_NAME=roja_postgres
  export DB_USER=roja_user
  export DB_PASSWORD=roja_user
  export DB_HOST=localhost
  export DB_PORT=$POSTGRES_PORT
  export API_URL=http://localhost:$FLASK_PORT
  export FLASK_SERVER_URL=http://127.0.0.1:$FLASK_PORT

  # Run Flask app
  python3 flask_app.py
```
OR you can execute them in the same command:

```bash
export FLASK_PORT=12000 POSTGRES_PORT=5432 DB_NAME=roja_postgres DB_USER=roja_user DB_PASSWORD=roja_user DB_HOST=localhost \
DB_PORT=5432 API_URL=http://localhost:12000 FLASK_SERVER_URL=http://127.0.0.1:12000 \
python3 flask_app.py
```

### START PostgreSQL Service

Start Postgres SQL service

```bash
export DB_USER=your_db_user DB_PASSWORD=your_db_password DB_NAME=your_db_name && \
service postgresql start && \
sleep 5 && \
su - postgres -c "psql -c \"CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';\"" && \
su - postgres -c "psql -c \"CREATE DATABASE $DB_NAME OWNER $DB_USER;\"" && \
su - postgres -c "psql -c \"ALTER USER postgres WITH PASSWORD '$DB_PASSWORD';\"" && \
service postgresql stop && \
rm -rf /var/lib/apt/lists/*
```

### Run Web browser application

1. Navigate to directory

```bash
  $ cd AI-Observability-Metrics/client-app
```

2. In .env file, set the REACT_APP_BACKEND_API_URL variable to point to backend api server.

3. Execute the following command:

```bash
  $ npm start
```

### Run Backend API Server application
1. Navigate to directory

```bash
  $ cd AI-Observability-Metrics/websocket-server
```
2. Set the environment variables in .env file.

3. Execute the following command:

```bash
  $ node server.js
```


### Section 2: Run your application

1. Set the following variables in ai_observability_metrics.py

```bash
GRAPHSIGNAL_API_KEY = None 
OPENAI_API_KEY = None
APPLICATION_NAME = None 
USER_NAME = None 
```

2. Execute the application: python3 ai_observability_metrics_app.py

3. Navigate to any web browser and visit: localhost:3000