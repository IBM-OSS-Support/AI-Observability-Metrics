const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const os = require('os'); // Import the os module

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const client = new Client({
  user: 'roja_user',
  host: '9.20.196.69',
  database: 'roja_postgres',
  password: 'roja_user',
  port: 5432,
});

client.connect();

// Function to get local IP addresses
function getLocalIPAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const iface of Object.values(interfaces)) {
    for (const { address, family, internal } of iface) {
      if (family === 'IPv4' && !internal) {
        addresses.push(address);
      }
    }
  }
  return addresses;
}

app.post('/data', async (req, res) => {
  const { query, params } = req.body;
  try {
    const result = await client.query(query, params);
    res.json(result.rows);
    console.log("Data retrieved successfully. Query: ", query);
  } catch (error) {
    console.error('Error executing query:', error.stack);
    res.status(500).send('Error executing query');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
  const ips = getLocalIPAddresses();
  console.log('Local IP addresses:', ips.join(', '));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  client.end(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});
