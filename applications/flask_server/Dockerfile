# Use the official Node.js image from the Docker Hub
FROM node:18

# Set the working directory in the container
WORKDIR /app


ENV REACT_APP_BACKEND_API_URL="http://localhost:5000/data"

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Expose the port the server is running on
EXPOSE 3001

# Command to run the application
CMD ["node", "server.js"]
