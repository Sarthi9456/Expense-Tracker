import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

ChartJS.register(ArcElement, Tooltip, Legend);

function monthOptions() {
  const now = new Date();
  const arr = [];
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
    arr.push({ value, label });
  }
  return arr;
}

export default function Reports() {
  const opts = useMemo(() => monthOptions(), []);
  const [month, setMonth] = useState(opts[0]?.value || '');
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const [year, monthNum] = useMemo(() => {
    const [y, m] = String(month).split('-');
    return [y, m];
  }, [month]);

  async function load() {
    setErr('');
    setLoading(true);
    try {
      const res = await api.get('/api/reports/monthly', { params: { year, month: monthNum } });
      setData(res.data);
    } catch (e) {
      setErr(e.response?.data?.message || 'Unable to fetch report');
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!month) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  async function downloadCSV() {
    setErr('');
    try {
      const token = localStorage.getItem('token');
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/export/csv?year=${year}&month=${monthNum}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `expenses_${year}_${monthNum}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (e) {
      setErr(e.message || 'Could not export CSV');
    }
  }

  const pieData = useMemo(() => {
    if (!data?.byCategory) return null;
    const entries = Object.entries(data.byCategory);
    const labels = entries.map(([k]) => k);
    const values = entries.map(([, v]) => v);
    const colors = labels.map((_, i) => `hsl(${(i * 55) % 360} 70% 55%)`);

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
        },
      ],
    };
  }, [data]);

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Card elevation={4}>
        <CardHeader title="Monthly Reports" />
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 3 }}>
            <FormControl sx={{ minWidth: 240 }}>
              <InputLabel id="month-select-label">Month</InputLabel>
              <Select
                labelId="month-select-label"
                value={month}
                label="Month"
                onChange={(e) => setMonth(e.target.value)}
              >
                {opts.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={downloadCSV} sx={{ ml: 'auto' }}>
              Export CSV
            </Button>
          </Box>

          {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : data ? (
            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 360px' } }}>
              <Paper sx={{ p: 3 }} elevation={2}>
                <Typography variant="h4" color="primary" gutterBottom>
                  ${data.total.toFixed(2)}
                </Typography>
                <Typography sx={{ mb: 1 }}>Expenses count: {data.expensesCount}</Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Category breakdown
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {Object.entries(data.byCategory).length === 0 ? (
                    <Typography>No expenses for this month.</Typography>
                  ) : (
                    Object.entries(data.byCategory)
                      .sort((a, b) => b[1] - a[1])
                      .map(([category, amount]) => (
                        <Box component="li" key={category} sx={{ mb: 1 }}>
                          <strong>{category}</strong>: ${amount.toFixed(2)}
                        </Box>
                      ))
                  )}
                </Box>
              </Paper>

              <Paper sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }} elevation={2}>
                {pieData ? <Pie data={pieData} /> : <Typography>No data available</Typography>}
              </Paper>
            </Box>
          ) : (
            <Typography>No report loaded yet.</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

