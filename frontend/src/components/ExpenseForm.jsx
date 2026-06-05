import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

export default function ExpenseForm({ onSubmit, initial = {} }) {
  const [amount, setAmount] = useState(initial.amount ?? '');
  const [category, setCategory] = useState(initial.category ?? '');
  const [date, setDate] = useState(
    initial.date ? initial.date.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [description, setDescription] = useState(initial.description ?? '');

  useEffect(() => {
    setAmount(initial.amount ?? '');
    setCategory(initial.category ?? '');
    setDate(initial.date ? initial.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
    setDescription(initial.description ?? '');
  }, [initial]);

  function submit(e) {
    e.preventDefault();
    onSubmit({ amount: Number(amount), category, date, description });
  }

  return (
    <Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 2, mb: 3 }}>
      <TextField
        required
        label="Amount"
        type="number"
        inputProps={{ min: 0, step: '0.01' }}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <TextField
        required
        label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <TextField
        required
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Button type="submit" variant="contained" size="large">
        Save Expense
      </Button>
    </Box>
  );
}

