const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const os = require('os'); // Import the os module

const app = express();
const port = process.env.SERVER_PORT;

app.use(cors());
app.use(express.json());

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Connect to the database and log a success message
client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database successfully.');
  })
  .catch(err => {
    console.log('Connection details:');
    console.log(`User: ${client.user}`);
    console.log(`Host: ${client.host}`);
    console.log(`Database: ${client.database}`);
    console.log(`Port: ${client.port}`);
    // For security reasons, avoid printing passwords directly in production.
    console.log(`Password: ${client.password ? '****' : 'Not set'}`);
    console.error('Failed to connect to the PostgreSQL database:', err.stack);
  });


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
    console.log("Error with query: ", query);
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
