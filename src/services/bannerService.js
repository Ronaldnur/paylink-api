const db = require('../db/index');

const getAllBanners = async () => {
  try {
    const { rows } = await db.query(
      `SELECT banner_name, banner_image, description
       FROM banners
       ORDER BY id ASC`
    );

    if (!rows.length) {
      return { success: false, message: 'Data banners kosong', data: [] };
    }

    return { success: true, data: rows };
  } catch (err) {
    console.error('❌ Banner Service Error:', err.message);
    return { success: false, message: 'Terjadi kesalahan server', data: [] };
  }
};

module.exports = { getAllBanners };
