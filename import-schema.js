const fs = require("fs");
const mysql = require("mysql2/promise");

(async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true,
  });

  // Read your schema.sql from database folder:
  const sql = fs.readFileSync("./database/schema.sql", "utf8");

  try {
    await connection.query(sql);
    console.log("✅ schema.sql imported successfully!");
  } catch (err) {
    console.error("❌ Import failed:", err.message);
  } finally {
    await connection.end();
  }
})();
