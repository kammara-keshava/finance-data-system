const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SALT_ROUNDS = 10;

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      const err = new Error('Email already registered');
      err.statusCode = 409;
      return next(err);
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'Viewer',
      status: 'Active',
    });

    const token = signToken(user);

    return res.status(201).json({ success: true, data: { token } });
  } catch (err) {
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isDeleted: false });
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 401;
      return next(err);
    }

    if (user.status === 'Inactive') {
      const err = new Error('Account is inactive. Please contact support.');
      err.statusCode = 403;
      return next(err);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const err = new Error('Invalid password');
      err.statusCode = 401;
      return next(err);
    }

    const token = signToken(user);

    return res.status(200).json({ success: true, data: { token } });
  } catch (err) {
    return next(err);
  }
};

module.exports = { register, login };
