require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const response = require('./utils/response');
const createTables = require('./migrations/create_tables');
const userRoutes = require('./routes/userRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Jalankan create table saat server start
createTables()
  .then(() => console.log('Database tables checked or created!'))
  .catch((err) => console.error('Error creating tables:', err));

// test route
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});


app.use(userRoutes);
app.use(bannerRoutes);
app.use(serviceRoutes);
app.use(transactionRoutes);

app.use((err, req, res, next) => {
  if (err.message === 'Format Image tidak sesuai') {
    return response.badRequest(res, err.message);
  }
  next(err);
});
// jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
