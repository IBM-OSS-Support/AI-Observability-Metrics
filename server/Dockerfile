# Stage 1: Build the Flask app
FROM registry.access.redhat.com/ubi8/ubi-minimal:latest

USER 0
RUN mkdir /app
WORKDIR /app

RUN microdnf install yum
RUN yum install python3-pip

# Copy only the requirements file to leverage Docker layer caching
COPY requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install langchain
RUN pip install openai
RUN pip install numexpr

# Copy the rest of the application files
COPY . .

# Expose the Flask app's port (replace 5000 with your app's port if needed)
EXPOSE 5000

# Run the Flask app using Gunicorn (adjust the parameters as needed)
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "GraphsignalFlaskProject.app:app"]
