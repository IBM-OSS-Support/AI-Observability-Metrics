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

  ws.on('message', async (message) => {
    if (message === 'getData') {
      try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM auditing;');
        ws.send(JSON.stringify(result.rows));
        client.release();
      } catch (error) {
        console.error('Error executing query', error);
        ws.send(JSON.stringify({ error: 'Error fetching data' }));
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

