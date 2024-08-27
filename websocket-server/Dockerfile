FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install && npm install dotenv && npm install ws --save && npm install pg --save
RUN apt-get update && apt-get install -y postgresql-client

COPY . .

EXPOSE 8080

CMD ["node", "server.js"]

