# Stage 1: Build the Flask app
FROM python:3.9 AS build

WORKDIR /app

# Copy only the requirements file to leverage Docker layer caching
COPY requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install langchain
RUN pip install openai
RUN pip install numexpr

# Copy the rest of the application files
COPY . .

# Stage 2: Run the Flask app
FROM python:3.9-slim

WORKDIR /app

# Copy the installed Python dependencies from the previous stage
COPY --from=build /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=build /usr/local/bin/gunicorn /usr/local/bin/gunicorn

# Copy the Flask application code
COPY . .

# Expose the Flask app's port (replace 5000 with your app's port if needed)
EXPOSE 5000

# Run the Flask app using Gunicorn (adjust the parameters as needed)
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "GraphsignalFlaskProject.app:app"]
