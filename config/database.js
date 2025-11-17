const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Get promise-based connection
const promisePool = pool.promise();

// Test connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('⚠️  Check your database credentials in .env file');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('⚠️  Database "travelxplore_db" does not exist. Please create it first.');
        }
        return;
    }
    console.log('✅ Database connected successfully!');
    connection.release();
});

module.exports = promisePool;
