const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireAuthenticated, requireAdmin } = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { createTransactionSchema, updateTransactionSchema } = require('../validators/transactionSchemas');
const {
  listTransactions,
  exportTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');

// GET  /              — all authenticated roles (read)
router.get('/', auth, requireAuthenticated, listTransactions);

// GET  /export        — Admin only (must be before /:id)
router.get('/export', auth, requireAdmin, exportTransactions);

// POST /              — Admin only
router.post('/', auth, requireAdmin, validate(createTransactionSchema), createTransaction);

// PUT  /:id           — Admin only
router.put('/:id', auth, requireAdmin, validate(updateTransactionSchema), updateTransaction);

// DELETE /:id         — Admin only
router.delete('/:id', auth, requireAdmin, deleteTransaction);

module.exports = router;
