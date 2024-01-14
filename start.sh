#!/bin/bash

# Function to stop and remove a container if it exists
stop_and_remove_container() {
    CONTAINER_NAME=$1
    if [ $(docker ps -a -q -f name=^/${CONTAINER_NAME}$) ]; then
        docker stop ${CONTAINER_NAME}
        docker rm ${CONTAINER_NAME}
    fi
}

# Build and run roja-metric-react-app
docker build -t roja-metric-react-app client
stop_and_remove_container roja-metric-react-app
docker run -d -p 9000:80 --name roja-metric-react-app roja-metric-react-app

# Build and run roja-metric-backend-db
docker build -t roja-metric-backend-db db
stop_and_remove_container roja-metric-backend-db
docker run -d -p 8086:8086 --name roja-metric-backend-db roja-metric-backend-db

# Build and run roja-metric-backend-app
docker build -t roja-metric-backend-app server
stop_and_remove_container roja-metric-backend-app
docker run -d -p 6000:6000 --name roja-metric-backend-app roja-metric-backend-app

echo "Containers built and started successfully."
