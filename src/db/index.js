// src/db/index.js
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // penting untuk koneksi Neon
});

// helper function buat query cepat
const query = (text, params) => pool.query(text, params);

// test koneksi langsung (optional, bisa dihapus kalau udah yakin)
pool.connect()
  .then(() => console.log('Connected to PostgreSQL successfully!'))
  .catch((err) => console.error('PostgreSQL connection error:', err.message));

module.exports = { pool, query };
