// services/userService.js
const db = require('../db/index');
const bcrypt = require('bcrypt');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken, verifyToken } = require('../utils/jwt');


const registerUser = async ({ email, password, first_name, last_name }) => {
  // Cek apakah email sudah ada
  const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return { success: false, message: "Email sudah terdaftar" };
  }

  // Hash password
  const hashedPassword = await hashPassword(password)

  // Insert user baru
  const result = await db.query(
    `INSERT INTO users (email, password, first_name, last_name)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, first_name, last_name`,
    [email, hashedPassword, first_name, last_name]
  );

  return { success: true, data: result.rows[0] };
};


const loginUser = async ({ email, password }) => {
  // Raw query PostgreSQL
  const sql = 'SELECT * FROM users WHERE email = $1 LIMIT 1';
  const { rows } = await db.query(sql, [email]);

  if (!rows.length) {
    return { success: false, message: 'Username atau password salah' };
  }

  const user = rows[0];

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    return { success: false, message: 'Username atau password salah' };
  }

  return { success: true, user };
};


const getUserProfile = async ({ userId }) => {
  // Ambil id, email, nama, dan image_url
  const sql = `
    SELECT id, email, first_name, last_name, image_url
    FROM users
    WHERE id = $1
  `;
  const { rows } = await db.query(sql, [userId]);

  if (!rows.length) {
    return { success: false, message: 'User tidak ditemukan' };
  }

  return { success: true, user: rows[0] };
};

const updateUserProfile = async ({ userId, first_name, last_name }) => {
  const sql = `
    UPDATE users
    SET first_name = $1,
        last_name = $2
    WHERE id = $3
    RETURNING id, email, first_name, last_name, image_url
  `;

  const { rows } = await db.query(sql, [first_name, last_name, userId]);

  if (!rows.length) {
    return { success: false, message: 'User tidak ditemukan atau gagal diupdate' };
  }

  return { success: true, user: rows[0] };
};


const updateProfileImage = async ({ userId, imageUrl }) => {
  const sql = `
    UPDATE users
    SET image_url = $1
    WHERE id = $2
    RETURNING id, email, first_name, last_name, image_url
  `;
  const { rows } = await db.query(sql, [imageUrl, userId]);

  if (!rows.length) {
    return { success: false, message: 'User tidak ditemukan atau gagal update' };
  }

  return { success: true, user: rows[0] };
};


module.exports = { registerUser,loginUser,getUserProfile,updateUserProfile,updateProfileImage};
