import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import ExpenseForm, { CATEGORIES } from '../components/ExpenseForm';
import { formatCurrency, getDateRange, todayStr } from '../utils/format';
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
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';

const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'lastMonth', label: 'Last month' },
  { value: 'custom', label: 'Custom range' },
];

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateRangePreset, setDateRangePreset] = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (categoryFilter !== 'All') params.category = categoryFilter;

      const { from, to } = getDateRange(dateRangePreset, customFrom, customTo);
      if (from) params.from = from;
      if (to) params.to = to;

      const { data } = await api.get('/api/expenses', { params });
      setExpenses(data.expenses || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load expenses');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, dateRangePreset, customFrom, customTo]);

  async function add(payload) {
    setError('');
    try {
      await api.post('/api/expenses', payload);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add expense');
    }
  }

  async function update(id, payload) {
    setError('');
    try {
      await api.put(`/api/expenses/${id}`, payload);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update expense');
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this expense? This cannot be undone.')) return;
    setError('');
    try {
      await api.delete(`/api/expenses/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete expense');
    }
  }

  // --- Summary calculations (based on the currently filtered list) ---
  const totalFiltered = useMemo(
    () => expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    [expenses]
  );

  const totalThisMonth = useMemo(() => {
    const now = new Date();
    return expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expenses]);

  const totalsByCategory = useMemo(() => {
    const map = {};
    for (const e of expenses) {
      map[e.category] = (map[e.category] || 0) + Number(e.amount || 0);
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const highestExpense = useMemo(() => {
    if (expenses.length === 0) return null;
    return expenses.reduce((max, e) => (Number(e.amount) > Number(max.amount) ? e : max), expenses[0]);
  }, [expenses]);

  return (
    <Box sx={{ display: 'grid', gap: 4 }}>
      {error && <Alert severity="error">{error}</Alert>}

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
          <Card elevation={4} sx={{ height: '100%' }}>
            <CardHeader title="Summary" />
            <CardContent>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total this month
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {formatCurrency(totalThisMonth)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total ({dateRangePreset === 'all' ? 'all time' : 'filtered view'})
                  </Typography>
                  <Typography variant="h6">{formatCurrency(totalFiltered)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {expenses.length} expense{expenses.length === 1 ? '' : 's'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Highest single expense
                  </Typography>
                  {highestExpense ? (
                    <Typography variant="h6">
                      {formatCurrency(highestExpense.amount)}{' '}
                      <Typography component="span" variant="body2" color="text.secondary">
                        ({highestExpense.category}, {new Date(highestExpense.date).toISOString().slice(0, 10)})
                      </Typography>
                    </Typography>
                  ) : (
                    <Typography variant="body2">—</Typography>
                  )}
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total per category
                  </Typography>
                  {totalsByCategory.length === 0 ? (
                    <Typography variant="body2">—</Typography>
                  ) : (
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      {totalsByCategory.map(([cat, amt]) => (
                        <Box component="li" key={cat}>
                          {cat}: {formatCurrency(amt)}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={4}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Expense History
          </Typography>

          {/* Filters */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <FormControl sx={{ minWidth: 180 }} size="small">
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                label="Category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="All">All categories</MenuItem>
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 180 }} size="small">
              <InputLabel id="date-range-label">Date range</InputLabel>
              <Select
                labelId="date-range-label"
                label="Date range"
                value={dateRangePreset}
                onChange={(e) => setDateRangePreset(e.target.value)}
              >
                {DATE_RANGE_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {dateRangePreset === 'custom' && (
              <>
                <TextField
                  size="small"
                  label="From"
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: todayStr() }}
                />
                <TextField
                  size="small"
                  label="To"
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: todayStr() }}
                />
              </>
            )}
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Note</TableCell>
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
                      No expenses found. {categoryFilter !== 'All' || dateRangePreset !== 'all'
                        ? 'Try adjusting your filters, or '
                        : ''}
                      add one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((e) => (
                    <TableRow key={e._id} hover>
                      <TableCell>{new Date(e.date).toISOString().slice(0, 10)}</TableCell>
                      <TableCell>{e.category}</TableCell>
                      <TableCell>{formatCurrency(e.amount)}</TableCell>
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
