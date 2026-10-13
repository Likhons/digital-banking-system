const mysql = require('mysql2/promise');
require('dotenv').config({ quiet: true });

// Cloud MySQL providers require SSL; DB_SSL_CA holds the provider's CA certificate
const ssl = process.env.DB_SSL === 'true'
  ? (process.env.DB_SSL_CA
    ? { ca: process.env.DB_SSL_CA.replace(/\n/g, '\n') }
    : { rejectUnauthorized: true })
  : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
