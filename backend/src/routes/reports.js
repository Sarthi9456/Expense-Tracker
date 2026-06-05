const express = require('express');
const { requireAuth } = require('../middleware/auth');
const Expense = require('../models/Expense');

const router = express.Router();
router.use(requireAuth);

function monthBounds(year, monthIndex1to12) {
  const m = Number(monthIndex1to12);
  const y = Number(year);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);
  return { start, end };
}

router.get('/monthly', async (req, res) => {
  const { year, month } = req.query;
  if (!year || !month) return res.status(400).json({ message: 'year and month are required' });

  const { start, end } = monthBounds(year, month);

  const expenses = await Expense.find({ userId: req.user.id, date: { $gte: start, $lt: end } });

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const byCategory = {};
  for (const e of expenses) {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  }

  res.json({ total, byCategory, expensesCount: expenses.length });
});

router.get('/export/csv', async (req, res) => {
  const { year, month } = req.query;
  if (!year || !month) return res.status(400).json({ message: 'year and month are required' });

  const { start, end } = monthBounds(year, month);
  const expenses = await Expense.find({ userId: req.user.id, date: { $gte: start, $lt: end } }).sort({ date: -1 });

  // Simple CSV (no extra deps)
  const header = ['date', 'category', 'amount', 'description'];
  const escape = (v) => {
    const s = String(v ?? '');
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const rows = [header.join(',')];
  for (const e of expenses) {
    rows.push([
      e.date.toISOString().slice(0, 10),
      escape(e.category),
      e.amount,
      escape(e.description),
    ].join(','));
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=expenses_${year}_${String(month).padStart(2, '0')}.csv`);
  res.status(200).send(rows.join('\n'));
});

module.exports = router;

