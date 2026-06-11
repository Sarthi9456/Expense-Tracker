import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';

export const CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function ExpenseForm({ onSubmit, initial = {} }) {
  const [amount, setAmount] = useState(initial.amount ?? '');
  const [category, setCategory] = useState(initial.category ?? CATEGORIES[0]);
  const [date, setDate] = useState(
    initial.date ? initial.date.slice(0, 10) : todayStr()
  );
  const [description, setDescription] = useState(initial.description ?? '');
  const [error, setError] = useState('');

  useEffect(() => {
    setAmount(initial.amount ?? '');
    setCategory(initial.category ?? CATEGORIES[0]);
    setDate(initial.date ? initial.date.slice(0, 10) : todayStr());
    setDescription(initial.description ?? '');
    setError('');
  }, [initial]);

  function validate() {
    const numAmount = Number(amount);
    if (!amount || Number.isNaN(numAmount) || numAmount <= 0) {
      return 'Amount must be a positive number';
    }
    if (!category) {
      return 'Category is required';
    }
    if (!date) {
      return 'Date is required';
    }
    if (date > todayStr()) {
      return 'Date cannot be in the future';
    }
    return '';
  }

  function submit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    onSubmit({ amount: Number(amount), category, date, description });
  }

  return (
    <Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 2, mb: 3 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        required
        label="Amount"
        type="number"
        inputProps={{ min: 0.01, step: '0.01' }}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <TextField
        required
        select
        label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {CATEGORIES.map((c) => (
          <MenuItem key={c} value={c}>
            {c}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        required
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        inputProps={{ max: todayStr() }}
      />
      <TextField
        label="Note (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Button type="submit" variant="contained" size="large">
        Save Expense
      </Button>
    </Box>
  );
}
