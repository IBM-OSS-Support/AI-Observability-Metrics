docker build -t roja-metric-react-app client

docker run -d -p 9000:80 roja-metric-react-app

docker build -t roja-metric-backend-db db

docker run -d -p 8086:8086 roja-metric-backend-db

docker build -t roja-metric-backend-app server

docker run -d -p 6000:6000 roja-metric-backend-app