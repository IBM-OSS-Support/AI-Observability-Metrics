# Flask Dockerfile
FROM python:3.9

WORKDIR /app

# Copy requirements and install them
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy all application code (flask_app.py, postgres.py, etc.)
COPY . .

# Run the Flask app
CMD ["flask", "run", "--host=0.0.0.0", "--port=3001"]
