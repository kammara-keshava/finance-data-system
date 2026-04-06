const Transaction = require('../models/Transaction');
const User = require('../models/User');

// ─── SHARED: summary helper ───────────────────────────────────────────────────
async function computeSummary(match = {}) {
  const results = await Transaction.aggregate([
    { $match: { isDeleted: false, ...match } },
    { $group: { _id: '$type', total: { $sum: '$amount' } } },
  ]);
  let totalIncome = 0, totalExpenses = 0;
  for (const r of results) {
    if (r._id === 'Income') totalIncome = r.total;
    else if (r._id === 'Expense') totalExpenses = r.total;
  }
  return { totalIncome, totalExpenses, netBalance: totalIncome - totalExpenses };
}

// GET /api/analytics/summary — all roles
const getSummary = async (req, res, next) => {
  try {
    const data = await computeSummary();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/analytics/category-breakdown — all roles
const getCategoryBreakdown = async (req, res, next) => {
  try {
    const results = await Transaction.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $project: { _id: 0, category: '$_id', total: 1, count: 1 } },
      { $sort: { total: -1 } },
    ]);

    // Add percentage
    const grandTotal = results.reduce((s, r) => s + r.total, 0);
    const data = results.map((r) => ({
      ...r,
      percentage: grandTotal > 0 ? Math.round((r.total / grandTotal) * 100) : 0,
    }));

    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/analytics/monthly-trends — all roles
const getMonthlyTrends = async (req, res, next) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const results = await Transaction.aggregate([
      { $match: { isDeleted: false, date: { $gte: twelveMonthsAgo } } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' }, total: { $sum: '$amount' } } },
    ]);

    const map = {};
    for (const r of results) {
      const { year, month, type } = r._id;
      const period = `${year}-${String(month).padStart(2, '0')}`;
      if (!map[period]) map[period] = { period, income: 0, expenses: 0 };
      if (type === 'Income') map[period].income = r.total;
      else if (type === 'Expense') map[period].expenses = r.total;
    }

    const data = Object.values(map).sort((a, b) => (a.period > b.period ? 1 : -1));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/analytics/weekly-trends — all roles
const getWeeklyTrends = async (req, res, next) => {
  try {
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const results = await Transaction.aggregate([
      { $match: { isDeleted: false, date: { $gte: eightWeeksAgo } } },
      { $group: { _id: { year: { $isoWeekYear: '$date' }, week: { $isoWeek: '$date' }, type: '$type' }, total: { $sum: '$amount' } } },
    ]);

    const map = {};
    for (const r of results) {
      const { year, week, type } = r._id;
      const period = `${year}-W${String(week).padStart(2, '0')}`;
      if (!map[period]) map[period] = { period, income: 0, expenses: 0 };
      if (type === 'Income') map[period].income = r.total;
      else if (type === 'Expense') map[period].expenses = r.total;
    }

    const data = Object.values(map).sort((a, b) => (a.period > b.period ? 1 : -1));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// GET /api/analytics/recent-activity — all roles
const getRecentActivity = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ isDeleted: false }).sort({ date: -1 }).limit(10);
    res.json({ success: true, data: transactions });
  } catch (err) { next(err); }
};

// GET /api/analytics/insights — Analyst + Admin only
const getInsights = async (req, res, next) => {
  try {
    const now = new Date();

    // This month boundaries
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      topCategoryResult,
      avgResult,
      highestExpenseDayResult,
      highestIncomeSourceResult,
      thisMonthSummary,
      lastMonthSummary,
      anomalyResult,
    ] = await Promise.all([
      // Top spending category
      Transaction.aggregate([
        { $match: { isDeleted: false, type: 'Expense' } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $limit: 1 },
      ]),

      // Average daily spending
      Transaction.aggregate([
        { $match: { isDeleted: false, type: 'Expense' } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, dayTotal: { $sum: '$amount' } } },
        { $group: { _id: null, avgDaily: { $avg: '$dayTotal' }, avgTx: { $avg: '$dayTotal' } } },
      ]),

      // Highest expense day
      Transaction.aggregate([
        { $match: { isDeleted: false, type: 'Expense' } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $limit: 1 },
      ]),

      // Highest income source (category)
      Transaction.aggregate([
        { $match: { isDeleted: false, type: 'Income' } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $limit: 1 },
      ]),

      // This month summary
      computeSummary({ date: { $gte: thisMonthStart } }),

      // Last month summary
      computeSummary({ date: { $gte: lastMonthStart, $lte: lastMonthEnd } }),

      // Anomaly: transactions > 2x average expense amount
      Transaction.aggregate([
        { $match: { isDeleted: false, type: 'Expense' } },
        { $group: { _id: null, avg: { $avg: '$amount' } } },
      ]),
    ]);

    const avgExpense = anomalyResult[0]?.avg ?? 0;
    const anomalyThreshold = avgExpense * 2;

    // Trend comparison
    const incomeChange = lastMonthSummary.totalIncome > 0
      ? Math.round(((thisMonthSummary.totalIncome - lastMonthSummary.totalIncome) / lastMonthSummary.totalIncome) * 100)
      : null;
    const expenseChange = lastMonthSummary.totalExpenses > 0
      ? Math.round(((thisMonthSummary.totalExpenses - lastMonthSummary.totalExpenses) / lastMonthSummary.totalExpenses) * 100)
      : null;

    res.json({
      success: true,
      data: {
        topSpendingCategory: topCategoryResult[0] ? { category: topCategoryResult[0]._id, amount: topCategoryResult[0].total } : null,
        highestExpenseDay: highestExpenseDayResult[0] ? { date: highestExpenseDayResult[0]._id, amount: highestExpenseDayResult[0].total } : null,
        highestIncomeSource: highestIncomeSourceResult[0] ? { category: highestIncomeSourceResult[0]._id, amount: highestIncomeSourceResult[0].total } : null,
        avgDailySpending: avgResult[0]?.avgDaily ?? 0,
        thisMonth: thisMonthSummary,
        lastMonth: lastMonthSummary,
        trends: { incomeChange, expenseChange },
        anomalyThreshold: Math.round(anomalyThreshold * 100) / 100,
      },
    });
  } catch (err) { next(err); }
};

// GET /api/analytics/anomalies — Analyst + Admin: transactions > 2x avg
const getAnomalies = async (req, res, next) => {
  try {
    const avgResult = await Transaction.aggregate([
      { $match: { isDeleted: false, type: 'Expense' } },
      { $group: { _id: null, avg: { $avg: '$amount' } } },
    ]);
    const avg = avgResult[0]?.avg ?? 0;
    const threshold = avg * 2;

    const anomalies = await Transaction.find({
      isDeleted: false,
      type: 'Expense',
      amount: { $gt: threshold },
    }).sort({ amount: -1 }).limit(20);

    res.json({ success: true, data: anomalies, threshold: Math.round(threshold * 100) / 100 });
  } catch (err) { next(err); }
};

// GET /api/admin/stats — Admin only
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalTransactions,
      revenueSummary,
      usersByRole,
      recentUsers,
      txPerDay,
    ] = await Promise.all([
      User.countDocuments({ isDeleted: false }),
      User.countDocuments({ isDeleted: false, status: 'Active' }),
      Transaction.countDocuments({ isDeleted: false }),
      computeSummary(),
      User.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      User.find({ isDeleted: false }).select('-password').sort({ createdAt: -1 }).limit(5),
      Transaction.aggregate([
        { $match: { isDeleted: false, date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, count: { $sum: 1 }, total: { $sum: '$amount' } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const roleMap = {};
    usersByRole.forEach((r) => { roleMap[r._id] = r.count; });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        totalTransactions,
        totalIncome: revenueSummary.totalIncome,
        totalExpenses: revenueSummary.totalExpenses,
        netBalance: revenueSummary.netBalance,
        usersByRole: roleMap,
        recentUsers,
        txPerDay,
      },
    });
  } catch (err) { next(err); }
};

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
  getInsights,
  getAnomalies,
  getAdminStats,
};
