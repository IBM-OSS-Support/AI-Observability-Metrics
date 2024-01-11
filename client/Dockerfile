# Stage 1: Build the React app
FROM registry.access.redhat.com/ubi8/nodejs-16:latest as build

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker layer caching
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve the React app using Nginx
FROM registry.access.redhat.com/ubi8/ubi-minimal:latest

RUN microdnf install yum

RUN yum -y install nginx

# Copy the built app from the previous stage to the NGINX directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]