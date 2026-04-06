const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireAuthenticated, requireAnalyst, requireAdmin } = require('../middleware/roleGuard');
const {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
  getInsights,
  getAnomalies,
  getAdminStats,
} = require('../controllers/analyticsController');

/**
 * Analytics routes:
 *
 *   Viewer + Analyst + Admin (requireAuthenticated):
 *     GET /summary
 *     GET /category-breakdown
 *     GET /monthly-trends
 *     GET /weekly-trends
 *     GET /recent-activity
 *
 *   Analyst + Admin only (requireAnalyst):
 *     GET /insights
 *     GET /anomalies
 *
 *   Admin only (requireAdmin):
 *     GET /admin-stats
 *
 * 401 → no/invalid token
 * 403 → authenticated but insufficient role
 */

// All analytics routes require a valid token first
router.use(auth);

// Viewer + Analyst + Admin
router.get('/summary', requireAuthenticated, getSummary);
router.get('/category-breakdown', requireAuthenticated, getCategoryBreakdown);
router.get('/monthly-trends', requireAuthenticated, getMonthlyTrends);
router.get('/weekly-trends', requireAuthenticated, getWeeklyTrends);
router.get('/recent-activity', requireAuthenticated, getRecentActivity);

// Analyst + Admin only
router.get('/insights', requireAnalyst, getInsights);
router.get('/anomalies', requireAnalyst, getAnomalies);

// Admin only
router.get('/admin-stats', requireAdmin, getAdminStats);

module.exports = router;
