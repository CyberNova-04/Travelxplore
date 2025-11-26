const fs = require("fs");
const mysql = require("mysql2/promise");

(async () => {
  // First connect WITHOUT specifying database (use 'railway' or no DB)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306,
    multipleStatements: true,
  });

  try {
    // Step 1: Create the database if it doesn't exist
    console.log("Creating database travelxplore_db...");
    await connection.query("CREATE DATABASE IF NOT EXISTS travelxplore_db");
    console.log("✅ Database created/verified");

    // Step 2: Use the database
    await connection.query("USE travelxplore_db");
    console.log("✅ Using travelxplore_db");

    // Step 3: Import the SQL file
    console.log("Importing travelxplore_db.sql...");
    const sql = fs.readFileSync("./travelxplore_db.sql", "utf8");
    await connection.query(sql);
    console.log("✅ travelxplore_db.sql imported successfully!");

  } catch (err) {
    console.error("❌ Import failed:", err.message);
  } finally {
    await connection.end();
  }
})();
