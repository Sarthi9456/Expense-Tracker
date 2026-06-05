const express = require('express');
const { z } = require('zod');

const Expense = require('../models/Expense');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const expenseSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1),
  date: z.string().refine((s) => !Number.isNaN(Date.parse(s)), 'Invalid date'),
  description: z.string().optional().default(''),
});

router.get('/', async (req, res) => {
  const { from, to } = req.query;
  const filter = { userId: req.user.id };

  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    // use $lt to avoid inclusive edge issues
    if (to) filter.date.$lt = new Date(to);
  }

  const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 });
  res.json({ expenses });
});

router.post('/', async (req, res) => {
  const parsed = expenseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', issues: parsed.error.issues });

  const expense = await Expense.create({
    userId: req.user.id,
    ...parsed.data,
    date: new Date(parsed.data.date),
  });

  res.status(201).json({ expense });
});

router.put('/:id', async (req, res) => {
  const parsed = expenseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input', issues: parsed.error.issues });

  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { ...parsed.data, date: new Date(parsed.data.date) },
    { new: true }
  );

  if (!expense) return res.status(404).json({ message: 'Not found' });
  res.json({ expense });
});

router.delete('/:id', async (req, res) => {
  const deleted = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;

