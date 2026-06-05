import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import ExpenseForm from '../components/ExpenseForm';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/expenses');
      setExpenses(data.expenses || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load expenses');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add(payload) {
    await api.post('/api/expenses', payload);
    setEditing(null);
    load();
  }

  async function update(id, payload) {
    await api.put(`/api/expenses/${id}`, payload);
    setEditing(null);
    load();
  }

  async function remove(id) {
    if (!window.confirm('Delete this expense?')) return;
    await api.delete(`/api/expenses/${id}`);
    load();
  }

  const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <Box sx={{ display: 'grid', gap: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card elevation={4}>
            <CardHeader title={editing ? 'Edit Expense' : 'Add Expense'} />
            <CardContent>
              <ExpenseForm
                initial={editing || {}}
                onSubmit={(vals) => (editing ? update(editing._id, vals) : add(vals))}
              />
              {editing && (
                <Button onClick={() => setEditing(null)} color="secondary">
                  Cancel Edit
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={4} sx={{ p: 2, minHeight: 1 }}>
            <Typography variant="h6">Summary</Typography>
            <Typography variant="h4" color="primary" sx={{ mt: 1 }}>
              ${total.toFixed(2)}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              {expenses.length} expense{expenses.length === 1 ? '' : 's'} recorded.
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={4}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Expense History
          </Typography>
          {error && <Typography color="error">{error}</Typography>}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Loading expenses...
                    </TableCell>
                  </TableRow>
                ) : expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No expenses yet. Add one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((e) => (
                    <TableRow key={e._id} hover>
                      <TableCell>{new Date(e.date).toISOString().slice(0, 10)}</TableCell>
                      <TableCell>{e.category}</TableCell>
                      <TableCell>${Number(e.amount).toFixed(2)}</TableCell>
                      <TableCell>{e.description || '-'}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => setEditing(e)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => remove(e._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </Box>
  );
}

