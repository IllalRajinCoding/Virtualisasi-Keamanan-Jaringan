'use strict';

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:               process.env.DB_HOST || '192.168.56.10',
  port:               parseInt(process.env.DB_PORT) || 3306,
  database:           process.env.DB_NAME || 'app1_db',
  user:               process.env.DB_USER || 'app1_user',
  password:           process.env.DB_PASS,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  connectTimeout:     10000,
});

// Test connection dengan retry
const testConnection = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await pool.getConnection();
      console.log(`[DB] ✓ Connected to MySQL — ${process.env.DB_NAME} @ ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
      conn.release();
      return;
    } catch (err) {
      console.error(`[DB] ✗ Attempt ${i + 1}/${retries} failed: ${err.message}`);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
  console.error('[DB] ✗ All connection attempts failed. Queries will fail until DB is reachable.');
};

testConnection();

module.exports = pool;
