# Use the official Node.js image from the Docker Hub
FROM node:18

ARG SERVER_PORT=5000

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Expose the port the server is running on
EXPOSE ${SERVER_PORT}

# Command to run the application
CMD ["node", "server.js"]
