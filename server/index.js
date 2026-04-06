require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// CORS — restrict to configured origin
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

// JSON body parser
app.use(express.json());

// --- Routes (mounted here as they are implemented) ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// 404 handler — must come after all routes
app.use((req, res, next) => {
  const err = new Error(`Not Found — ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
});

// Global error handler
app.use(errorHandler);

// MongoDB connection + server start
const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
