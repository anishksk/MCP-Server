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

// API Endpoints
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