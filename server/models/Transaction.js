const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  type: {
    type: String,
    enum: ['Income', 'Expense'],
    required: true,
  },
  category: {
    type: String,
    enum: ['Food', 'Salary', 'Rent', 'Transport', 'Healthcare', 'Entertainment', 'Other'],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for filtered list and category breakdown queries
transactionSchema.index({ isDeleted: 1, date: -1 });
transactionSchema.index({ isDeleted: 1, category: 1 });

// Update updatedAt on every save
transactionSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
