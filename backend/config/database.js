const { Pool } = require("pg");

const isProduction =
  process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  ssl: isProduction
    ? { rejectUnauthorized: false }
    : false,

  max: 10,

  idleTimeoutMillis: 30000,

  connectionTimeoutMillis: 10000
});

pool.on("error", (error) => {
  console.error(
    "Unexpected PostgreSQL error:",
    error
  );
});

async function testDatabaseConnection() {
  const client = await pool.connect();

  try {
    const result = await client.query(
      "SELECT NOW() AS current_time"
    );

    console.log(
      "PostgreSQL connected:",
      result.rows[0].current_time
    );

    return true;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  testDatabaseConnection
};