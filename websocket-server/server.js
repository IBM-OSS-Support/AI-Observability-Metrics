const WebSocket = require('ws');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'roja_user',
  host: '9.20.196.69',
  database: 'roja_postgres',
  password: 'roja_user',
  port: 5432,
});

const wss = new WebSocket.Server({ port: 8080 });

/*
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Attempt to establish connection to PostgreSQL
  pool.connect((err, client, release) => {
    if (err) {
      console.error('Error connecting to PostgreSQL:', err);
      return;
    }
    
    console.log('Connected to PostgreSQL');
    
    // Execute a SELECT SQL query
    client.query('select flagged from auditing order by timestamp limit 1', (err, result) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        release();
        return;
      }

      console.log('Query result:', result.rows);
      
      // Send the query result to the WebSocket client
      ws.send(JSON.stringify(result.rows));

      // Release the client when the WebSocket connection is closed
      ws.on('close', () => {
        release();
        console.log('Client disconnected');
      });
    });
  });
});
*/
// Define a function to handle incoming messages
wss.on('connection', (ws) => {
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
    } else if (data.tab === 'performance') {
      // Execute PostgreSQL query for performance
      // Assuming you have a PostgreSQL client setup
      // Replace 'your_query_here' with your actual query
      console.log(data.action)
      pool.query(data.action, (err, result) => {
        if (err) {
          console.log('Error with Performance query');
        } else {
          // Send query result back to client
          ws.send(JSON.stringify(result.rows));
        }
      });
    }
  });
});