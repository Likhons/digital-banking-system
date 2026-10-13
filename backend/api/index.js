// Vercel serverless entry point: the same Express app, without app.listen()
require('dotenv').config({ quiet: true });

module.exports = require('../app');
