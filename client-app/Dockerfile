# Use the Node.js base image
FROM node:18

# Set working directory for the app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire application to the working directory
COPY . .

# Expose port (adjust if necessary)
EXPOSE 3000

# Command to start the application
CMD ["npm", "start"]
