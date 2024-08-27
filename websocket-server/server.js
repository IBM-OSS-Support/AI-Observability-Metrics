const WebSocket = require('ws');
const { Pool } = require('pg');

require('dotenv').config();

const wsPort = process.env.DB_PORT;
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

const pool = new Pool({
  user: dbUser,
  host: dbHost,
  database: dbName,
  password: dbPassword,
  port: wsPort,
});

const wss = new WebSocket.Server({ port: 8080 });

// Define a function to handle incoming messages
wss.on('connection', (ws) => {
  console.log("running websocket")
  console.log(pool)
  ws.on('message', (message) => {
    // Parse the incoming message
    console.log('Received message from client:', message);
    const data = JSON.parse(message);
    console.log('data123', data);
    // Check the content of the message
    if (data.tab === 'auditing') {
      // Execute PostgreSQL query for auditing
      // Assuming you have a PostgreSQL client setup
      // Replace 'your_query_here' with your actual query
      console.log(data.action)
      pool.query(data.action, (err, result) => {
        if (err) {
          console.log('Error with Auditing query', err);
        } else {
          // Send query result back to client
          ws.send(JSON.stringify(result.rows)); console.log('checking error');
        }
      });
    }
  });
});