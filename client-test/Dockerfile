# Use Node.js image as base
FROM node:14 as build

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install && npm install node-sass

RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object

# Copy the entire application to the working directory
COPY . .

# Build the React app
RUN npm run build

# Use nginx image as base for serving the static files
FROM nginx:alpine

# Copy the built files from the previous stage to nginx directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Command to start nginx
CMD ["nginx", "-g", "daemon off;"]

