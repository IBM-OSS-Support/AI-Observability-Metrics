FROM python:3.9

# Set the working directory in the container
WORKDIR /app/

# Copy the requirements file into the container
COPY requirements.txt requirements.txt

# Install any needed packages specified in requirements.txt
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy the rest of the application contents into the container
COPY . .
# Copy the start script into the container
COPY entrypoint.sh /entrypoint.sh
# Make port 5000 available to the world outside this container
EXPOSE 5000

# Set the entry point to the start script
ENTRYPOINT ["/entrypoint.sh"]
