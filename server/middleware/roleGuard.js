/**
 * Role-based authorization middleware.
 *
 * Usage (named exports):
 *   requireAuthenticated  — any valid JWT (Viewer, Analyst, Admin)
 *   requireAnalyst        — Analyst or Admin
 *   requireAdmin          — Admin only
 *   requireRole(...roles) — generic factory for custom combinations
 *
 * All middleware assume auth.js has already run and attached req.user.
 * Returns 403 Forbidden when the role check fails.
 */

function forbidden(next, message = 'Forbidden: insufficient permissions') {
  const err = new Error(message);
  err.statusCode = 403;
  return next(err);
}

// Any authenticated user (Viewer / Analyst / Admin)
const requireAuthenticated = (req, res, next) => {
  if (!req.user) return forbidden(next, 'Forbidden: not authenticated');
  next();
};

// Analyst or Admin
const requireAnalyst = (req, res, next) => {
  if (!req.user || !['Analyst', 'Admin'].includes(req.user.role)) {
    return forbidden(next, 'Forbidden: Analyst or Admin role required');
  }
  next();
};

// Admin only
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'Admin') {
    return forbidden(next, 'Forbidden: Admin role required');
  }
  next();
};

// Generic factory — requireRole('Viewer', 'Analyst') etc.
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return forbidden(next, `Forbidden: one of [${roles.join(', ')}] role required`);
  }
  next();
};

module.exports = { requireAuthenticated, requireAnalyst, requireAdmin, requireRole };
