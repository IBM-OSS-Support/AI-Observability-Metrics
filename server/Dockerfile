# Stage 1: Build the Flask app
FROM registry.access.redhat.com/ubi8/ubi-minimal:latest

USER 0
RUN mkdir /app
WORKDIR /app

RUN microdnf install yum
RUN yum update -y && \
    yum -y install python3.9 && \
    alternatives --set python3 /usr/bin/python3.9 && \
    alternatives --set python /usr/bin/python3.9 && \
    python3 --version && \
    python --version && \
    yum -y install python39-devel && \
    pip3 install --upgrade pip && \
    pip3 --version && \
    pip --version 

# Copy only the requirements file to leverage Docker layer caching
COPY requirements.txt .

# Install the Python dependencies
RUN pip3 install -r requirements.txt
RUN pip3 install langchain
RUN pip3 install openai
RUN pip3 install numexpr

RUN mkdir -p /tmp/test

# Copy the rest of the application files
COPY . .

# # Expose the Flask app's port (replace 5000 with your app's port if needed)
# EXPOSE 5000

CMD ["python3", "GraphsignalFlaskProject/app.py"]

# # Run the Flask app using Gunicorn (adjust the parameters as needed)
# CMD ["gunicorn", "--bind", "0.0.0.0:5000", "GraphsignalFlaskProject.app:app"]
