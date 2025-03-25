require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const skysql = require('./skysql');

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

// SkySQL connection configuration
const dbConfig = {
  host: process.env.SKYSQL_HOST,
  user: process.env.SKYSQL_USER,
  password: process.env.SKYSQL_PASSWORD,
  database: process.env.SKYSQL_DATABASE
};

// Create database connection pool
const pool = mysql.createPool(dbConfig);

// MCP JSON-RPC Endpoint
app.post('/mcp', async (req, res) => {
  const { method, params, id } = req.body;

  try {
    let result;
    switch (method) {
      case 'tools/list':
        result = {
          tools: [
            {
              name: 'createDatabase',
              description: 'Create a new serverless database',
              parameters: [
                { name: 'name', type: 'string', required: true },
                { name: 'region', type: 'string', required: false, default: 'us-central1' }
              ]
            },
            {
              name: 'deleteDatabase',
              description: 'Delete a serverless database',
              parameters: [
                { name: 'databaseId', type: 'string', required: true }
              ]
            },
            {
              name: 'getDatabaseStatus',
              description: 'Get the status of a database',
              parameters: [
                { name: 'databaseId', type: 'string', required: true }
              ]
            },
            {
              name: 'listDatabases',
              description: 'List all databases',
              parameters: []
            }
          ]
        };
        break;

      case 'initialize':
        result = { initialized: true };
        break;

      case 'createDatabase':
        result = await skysql.createServerlessDatabase(params.name, params.region);
        break;

      case 'deleteDatabase':
        result = await skysql.deleteServerlessDatabase(params.databaseId);
        break;

      case 'getDatabaseStatus':
        result = await skysql.getDatabaseStatus(params.databaseId);
        break;

      case 'listDatabases':
        result = await skysql.listDatabases();
        break;

      default:
        throw new Error(`Method ${method} not found`);
    }

    res.json({
      jsonrpc: '2.0',
      result,
      id
    });
  } catch (error) {
    console.error('MCP Error:', error);
    res.status(200).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: error.message
      },
      id
    });
  }
});

// Existing REST API endpoints
app.post('/api/query', async (req, res) => {
  try {
    const { sql } = req.body;
    const [results] = await pool.execute(sql);
    res.json({ success: true, results });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/databases', async (req, res) => {
  try {
    const { name, region } = req.body;
    console.log('Received request to create database:', { name, region });
    const result = await skysql.createServerlessDatabase(name, region);
    res.json({ success: true, database: result });
  } catch (error) {
    console.error('Error creating database:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response ? error.response.data : null
    });
  }
});

app.delete('/api/databases/:id', async (req, res) => {
  try {
    const result = await skysql.deleteServerlessDatabase(req.params.id);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error deleting database:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response ? error.response.data : null
    });
  }
});

app.get('/api/databases/:id', async (req, res) => {
  try {
    const status = await skysql.getDatabaseStatus(req.params.id);
    res.json({ success: true, status });
  } catch (error) {
    console.error('Error getting database status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response ? error.response.data : null
    });
  }
});

app.get('/api/databases', async (req, res) => {
  try {
    const databases = await skysql.listDatabases();
    res.json({ success: true, databases });
  } catch (error) {
    console.error('Error listing databases:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response ? error.response.data : null
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 