const User = require('../models/User');

// GET /api/users — Admin only
const listUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isDeleted: false }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id — Admin: update role and/or status
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, isDeleted: false });
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      return next(err);
    }

    const { role, status } = req.body;
    if (role !== undefined) {
      if (!['Viewer', 'Analyst', 'Admin'].includes(role)) {
        const err = new Error('Invalid role. Must be Viewer, Analyst, or Admin.');
        err.statusCode = 400;
        return next(err);
      }
      user.role = role;
    }
    if (status !== undefined) {
      if (!['Active', 'Inactive'].includes(status)) {
        const err = new Error('Invalid status. Must be Active or Inactive.');
        err.statusCode = 400;
        return next(err);
      }
      user.status = status;
    }

    await user.save();
    const updated = user.toObject();
    delete updated.password;
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id/role — Admin: change role only
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role || !['Viewer', 'Analyst', 'Admin'].includes(role)) {
      const err = new Error('Invalid role. Must be Viewer, Analyst, or Admin.');
      err.statusCode = 400;
      return next(err);
    }

    const user = await User.findOne({ _id: req.params.id, isDeleted: false });
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      return next(err);
    }

    user.role = role;
    await user.save();
    const updated = user.toObject();
    delete updated.password;
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id/status — Admin: activate or deactivate
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status || !['Active', 'Inactive'].includes(status)) {
      const err = new Error('Invalid status. Must be Active or Inactive.');
      err.statusCode = 400;
      return next(err);
    }

    const user = await User.findOne({ _id: req.params.id, isDeleted: false });
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      return next(err);
    }

    user.status = status;
    await user.save();
    const updated = user.toObject();
    delete updated.password;
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id — Admin: soft delete
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, isDeleted: false });
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      return next(err);
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user.id) {
      const err = new Error('You cannot delete your own account.');
      err.statusCode = 400;
      return next(err);
    }

    user.isDeleted = true;
    await user.save();
    res.json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

module.exports = { listUsers, updateUser, updateUserRole, updateUserStatus, deleteUser };
