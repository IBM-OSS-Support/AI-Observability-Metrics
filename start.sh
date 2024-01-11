docker build -t roja-metric-react-app client

docker run -p 9000:80 roja-metric-react-app

docker build -t roja-metric-backend-app server

docker run -p 5000:5000 roja-metric-backend-app