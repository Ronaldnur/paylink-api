const db = require('../db/index');

const generateInvoiceNumber = async () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const dateStr = `${day}${month}${year}`; // DDMMYYYY

  // ambil jumlah transaksi hari ini
  const { rows } = await db.query(
    `SELECT COUNT(*) as count FROM transactions 
     WHERE created_at::date = CURRENT_DATE`
  );
  const count = parseInt(rows[0].count) + 1;
  const seq = String(count).padStart(3, '0');

  return `INV${dateStr}-${seq}`;
};

module.exports = { generateInvoiceNumber };
