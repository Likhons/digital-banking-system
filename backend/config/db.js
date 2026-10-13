const { Pool } = require('pg');
require('dotenv').config({ quiet: true });

// Neon-এর DATABASE_URL-এ sslmode=require থাকে, pg নিজেই সেটা থেকে SSL চালু করে
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

module.exports = pool;
