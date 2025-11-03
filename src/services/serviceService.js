const db = require('../db/index');

const getAllServices = async () => {
  try {
    const { rows } = await db.query(
      `SELECT service_code, service_name, service_icon, service_tariff
       FROM services
       ORDER BY id ASC`
    );

    if (!rows.length) {
      return { success: false, message: 'Data services kosong', data: [] };
    }

     const formattedRows = rows.map(row => ({
      ...row,
      service_tariff: parseFloat(row.service_tariff).toString()
    }));

    return { success: true, data: formattedRows };
  } catch (err) {
    console.error('❌ Service Error:', err.message);
    return { success: false, message: 'Terjadi kesalahan server', data: [] };
  }
};

module.exports = { getAllServices };
