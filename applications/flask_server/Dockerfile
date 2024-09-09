# Flask Dockerfile
FROM python:3.9

WORKDIR /app

# Copy requirements and install them
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy all application code (flask_app.py, postgres.py, etc.)
COPY . .

# Set environment variables
ENV DB_NAME=roja_postgres
ENV DB_USER=roja_user
ENV DB_PASSWORD=roja_user
ENV DB_HOST=9.20.196.69
ENV DB_PORT=5432

# Set environment variables
ENV FLASK_APP=flask_app.py

# Run the Flask app
CMD ["flask", "run", "--host=0.0.0.0", "--port=3001"]
