const pg = require("pg");
const dotenv = require("dotenv");


dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

const createTables = async () => {
  const client = await pool.connect();

  try {
    console.log("🚀 Starting table creation...");

    await client.query("BEGIN");

    // USERS
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(150) UNIQUE NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        password VARCHAR(255) NOT NULL,
        image_url TEXT,
        balance NUMERIC(12,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // BANNERS
    await client.query(`
      CREATE TABLE IF NOT EXISTS banners (
        id SERIAL PRIMARY KEY,
        banner_name VARCHAR(255) UNIQUE NOT NULL,
        banner_image TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // SERVICES
    await client.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        service_code VARCHAR(50) UNIQUE NOT NULL,
        service_name VARCHAR(150) NOT NULL,
        service_icon TEXT,
        service_tariff NUMERIC(12,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);


    // TRANSACTIONS
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        service_id INT REFERENCES services(id),
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        amount NUMERIC(12,2) NOT NULL,
        transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('TOPUP','PAYMENT')),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query("COMMIT");
    console.log("✅ All tables created successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error creating tables:", err.message);
  } finally {
    client.release();
    pool.end();
  }
};

module.exports = createTables;
