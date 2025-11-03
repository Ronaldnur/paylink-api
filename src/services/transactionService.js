const db = require('../db/index');
const { generateInvoiceNumber } = require('../utils/invoice');


const getBalance = async ({ userId }) => {
  try {
    const { rows } = await db.query(
      `SELECT balance FROM users WHERE id = $1`,
      [userId]
    );

    if (!rows.length) {
      return { success: false, message: 'User tidak ditemukan', data: null };
    }

    return { success: true, data: { balance: parseInt(rows[0].balance) || 0 } };
  } catch (err) {
    console.error('❌ Transaction Service Error:', err.message);
    return { success: false, message: 'Terjadi kesalahan server', data: null };
  }
};


const topUpBalance = async ({ userId, amount }) => {
  try {
    // Validasi amount
    if (typeof amount !== 'number' || amount <= 0) {
      return { success: false, message: 'Paramter amount hanya boleh angka dan tidak boleh lebih kecil dari 0', data: null };
    }

    // Update balance
    const updateBalanceSQL = `
      UPDATE users
      SET balance = balance + $1
      WHERE id = $2
      RETURNING balance
    `;
    const { rows } = await db.query(updateBalanceSQL, [amount, userId]);

    if (!rows.length) {
      return { success: false, message: 'User tidak ditemukan', data: null };
    }

    // Generate invoice_number
    const invoiceNumber = await generateInvoiceNumber();

    // Insert transaksi
    const insertTransactionSQL = `
      INSERT INTO transactions (user_id, transaction_type, amount, invoice_number,description)
      VALUES ($1, 'TOPUP', $2, $3,$4)
    `;
    await db.query(insertTransactionSQL, [userId, amount, invoiceNumber,'Top Up balance']);

    return { success: true, data: { balance: parseInt(rows[0].balance) } };
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Terjadi kesalahan server', data: null };
  }
};

const createTransaction = async ({ userId, service_code }) => {
  try {
    // 1. Ambil info service dari DB
    const serviceResult = await db.query(
      `SELECT * FROM services WHERE service_code = $1`,
      [service_code]
    );
    if (!serviceResult.rows.length) {
      return { success: false, message: 'Service atau Layanan tidak ditemukan', data: null };
    }
    const service = serviceResult.rows[0];

    // 2. Ambil balance user
    const userResult = await db.query(
      `SELECT balance FROM users WHERE id = $1`,
      [userId]
    );
    if (!userResult.rows.length) {
      return { success: false, message: 'User tidak ditemukan', data: null };
    }
    const balance = parseFloat(userResult.rows[0].balance);

    // 3. Cek apakah balance cukup
    if (balance < parseFloat(service.service_tariff)) {
      return { success: false, message: 'Balance tidak mencukupi', data: null };
    }

    // 4. Kurangi balance user
    const newBalanceResult = await db.query(
      `UPDATE users
       SET balance = balance - $1
       WHERE id = $2
       RETURNING balance`,
      [service.service_tariff, userId]
    );

    // 5. Generate invoice
    const invoiceNumber = await generateInvoiceNumber();

    // 6. Insert transaksi PAYMENT
    const insertTxSQL = `
      INSERT INTO transactions (user_id, service_id,transaction_type, amount, invoice_number, description)
      VALUES ($1, $2, 'PAYMENT', $3, $4, $5)
      RETURNING id,transaction_type, amount, invoice_number, created_at
    `;
    const txResult = await db.query(insertTxSQL, [
      userId,
      service.id,
      service.service_tariff,
      invoiceNumber,
      `Pembayaran layanan ${service.service_name}`,
    ]);

    const tx = txResult.rows[0];

    return {
      success: true,
      data: {
        invoice_number: tx.invoice_number,
        service_code: service.service_code,
        service_name: service.service_name,
        transaction_type: tx.transaction_type,
        total_amount: parseFloat(tx.amount),
        created_on: tx.created_at,
      },
    };
  } catch (err) {
    console.error('Transaction Error:', err);
    return { success: false, message: 'Terjadi kesalahan server', data: null };
  }
};



const getTransactionHistory = async ({ userId, offset = 0, limit = null }) => {
  try {
    let sql = `
      SELECT invoice_number, transaction_type, description, amount, created_at
      FROM transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const params = [userId];

    if (limit) {
      sql += ` LIMIT $2 OFFSET $3`;
      params.push(Number(limit), Number(offset));
    }

    const { rows } = await db.query(sql, params);

    const records = rows.map(r => ({
      invoice_number: r.invoice_number,
      transaction_type: r.transaction_type,
      description: r.description,
      total_amount: parseFloat(r.amount),
      created_on: r.created_at
    }));

    return { success: true, data: { offset: Number(offset), limit: limit ? Number(limit) : null, records } };
  } catch (err) {
    console.error('Transaction History Error:', err);
    return { success: false, message: 'Terjadi kesalahan server', data: null };
  }
};

module.exports = { getBalance,topUpBalance,createTransaction,getTransactionHistory};
