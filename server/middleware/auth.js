const jwt = require('jsonwebtoken');

/**
 * JWT authentication middleware.
 * Verifies the Authorization: Bearer <token> header.
 * On success, attaches req.user = { id, role } and calls next().
 * On failure, calls next(err) with a 401 error.
 */
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Not authorized, no token');
    err.statusCode = 401;
    return next(err);
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      err.message = 'Token expired';
    } else if (err.name === 'JsonWebTokenError') {
      err.message = 'Not authorized, invalid token';
    }
    err.statusCode = 401;
    next(err);
  }
};

module.exports = auth;
