const Transaction = require('../models/Transaction');

// ─── Shared query builder ─────────────────────────────────────────────────────
function buildQuery(q) {
  const query = { isDeleted: false };

  if (q.startDate || q.endDate) {
    query.date = {};
    if (q.startDate) query.date.$gte = new Date(q.startDate);
    if (q.endDate) {
      // Include the full end day
      const end = new Date(q.endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  if (q.category && q.category.trim() !== '') query.category = q.category;

  if (q.type && q.type.trim() !== '' && q.type !== 'All') query.type = q.type;

  if (q.search && q.search.trim() !== '') {
    const regex = new RegExp(q.search.trim(), 'i');
    query.$or = [{ description: regex }, { category: regex }];
  }

  return query;
}

// ─── Shared sort builder ──────────────────────────────────────────────────────
function buildSort(sortBy, order) {
  const dir = order === 'asc' ? 1 : -1;
  const field = sortBy === 'amount' ? 'amount' : 'date';
  // Secondary sort always by createdAt desc for stable ordering
  return { [field]: dir, createdAt: -1 };
}

// GET /api/transactions
const listTransactions = async (req, res, next) => {
  try {
    const query = buildQuery(req.query);
    const sort = buildSort(req.query.sortBy, req.query.order);

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(query).sort(sort).skip(skip).limit(limit),
      Transaction.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({ success: true, data: transactions, total, page, limit, totalPages });
  } catch (err) {
    next(err);
  }
};

// GET /api/transactions/export  (Admin only — enforced in route)
const exportTransactions = async (req, res, next) => {
  try {
    const query = buildQuery(req.query);
    const sort = buildSort(req.query.sortBy, req.query.order);

    // No pagination for export — get all matching records (cap at 10k for safety)
    const transactions = await Transaction.find(query).sort(sort).limit(10000);

    const header = 'Date,Type,Category,Amount,Description';
    const rows = transactions.map((t) => {
      const date = new Date(t.date).toLocaleDateString('en-US');
      const desc = (t.description || '').replace(/"/g, '""');
      return `${date},${t.type},${t.category},${t.amount},"${desc}"`;
    });

    const csv = [header, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

// POST /api/transactions
const createTransaction = async (req, res, next) => {
  try {
    const { amount, type, category, date, description } = req.body;
    const transaction = await Transaction.create({
      amount, type, category, date, description,
      userId: req.user.id,
    });
    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
};

// PUT /api/transactions/:id
const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, isDeleted: false });
    if (!transaction) {
      const err = new Error('Transaction not found');
      err.statusCode = 404;
      return next(err);
    }

    // Only allow these fields — ignore any system fields sent by mistake
    const allowed = ['amount', 'type', 'category', 'date', 'description'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) transaction[field] = req.body[field];
    });

    await transaction.save();
    res.json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/transactions/:id
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, isDeleted: false });
    if (!transaction) {
      const err = new Error('Transaction not found');
      err.statusCode = 404;
      return next(err);
    }

    transaction.isDeleted = true;
    await transaction.save();
    res.json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listTransactions,
  exportTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
