const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

const User = require('../models/User');

const router = express.Router();

// Wrap async handlers so errors propagate to Express error middleware
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post('/register', wrap(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', issues: parsed.error.issues });

  const { email, password } = parsed.data;

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already in use' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash });

  const token = jwt.sign({ id: user._id.toString(), email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  return res.status(201).json({ token, user: { id: user._id, email: user.email } });
}));

const loginSchema = registerSchema;

router.post('/login', wrap(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', issues: parsed.error.issues });

  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id.toString(), email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  return res.json({ token, user: { id: user._id, email: user.email } });
}));

router.get('/me', (req, res) => {
  return res.json({ message: 'Use JWT auth with /api/* endpoints' });
});

module.exports = router;
