const express = require('express');
const { z } = require('zod');

const Expense = require('../models/Expense');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Wrap async handlers so errors propagate to Express error middleware
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const expenseSchema = z.object({
  amount: z.number().positive('Amount must be a positive number'),
  category: z.string().min(1, 'Category is required'),
  date: z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), 'Invalid date')
    .refine((s) => {
      // Reject dates more than 1 day in the future (allows for timezone slack)
      const d = new Date(s);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return d < tomorrow;
    }, 'Date cannot be in the future'),
  description: z.string().optional().default(''),
});

router.get('/', wrap(async (req, res) => {
  const { from, to, category } = req.query;
  const filter = { userId: req.user.id };

  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lt = new Date(to);
  }

  if (category && category !== 'All') {
    filter.category = category;
  }

  const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 });
  res.json({ expenses });
}));

router.post('/', wrap(async (req, res) => {
  const parsed = expenseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', issues: parsed.error.issues });

  const expense = await Expense.create({
    userId: req.user.id,
    ...parsed.data,
    date: new Date(parsed.data.date),
  });

  res.status(201).json({ expense });
}));

router.put('/:id', wrap(async (req, res) => {
  const parsed = expenseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', issues: parsed.error.issues });

  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { ...parsed.data, date: new Date(parsed.data.date) },
    { new: true }
  );

  if (!expense) return res.status(404).json({ message: 'Not found' });
  res.json({ expense });
}));

router.delete('/:id', wrap(async (req, res) => {
  const deleted = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
}));

module.exports = router;
