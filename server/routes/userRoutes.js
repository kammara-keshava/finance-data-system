const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleGuard');
const {
  listUsers,
  updateUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} = require('../controllers/userController');

/**
 * All user management routes:
 *   auth            — must have a valid JWT
 *   requireAdmin    — must be Admin role
 *
 * 401 → no/invalid token
 * 403 → authenticated but not Admin
 */
router.use(auth, requireAdmin);

router.get('/', listUsers);
router.put('/:id', updateUser);
router.patch('/:id/role', updateUserRole);
router.patch('/:id/status', updateUserStatus);
router.delete('/:id', deleteUser);

module.exports = router;
