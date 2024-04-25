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
    client.query('SELECT * FROM auditing', (err, result) => {
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