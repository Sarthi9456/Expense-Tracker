import React from 'react';
import { Routes, Route, Navigate, Link as RouterLink, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Login from './pages/Login';
import Register from './pages/Register';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';

function isAuthed() {
  return Boolean(localStorage.getItem('token'));
}

function Private({ children }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return children;
}

function Public({ children }) {
  if (isAuthed()) return <Navigate to="/expenses" replace />;
  return children;
}

export default function App() {
  const [authed, setAuthed] = React.useState(isAuthed());
  const navigate = useNavigate();

  React.useEffect(() => {
    const syncAuth = () => setAuthed(isAuthed());
    window.addEventListener('storage', syncAuth);
    window.addEventListener('authchange', syncAuth);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('authchange', syncAuth);
    };
  }, []);

  function logout() {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('authchange'));
    navigate('/login');
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="primary" elevation={2}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h6" component={RouterLink} to="/" sx={{ color: '#fff', textDecoration: 'none', flexGrow: 1 }}>
              Expense Tracker
            </Typography>
            <Button component={RouterLink} to="/expenses" color="inherit">
              Expenses
            </Button>
            <Button component={RouterLink} to="/reports" color="inherit">
              Reports
            </Button>
            {authed ? (
              <Button onClick={logout} color="inherit">
                Logout
              </Button>
            ) : (
              <>
                <Button component={RouterLink} to="/login" color="inherit">
                  Login
                </Button>
                <Button component={RouterLink} to="/register" color="inherit">
                  Register
                </Button>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Routes>
          <Route path="/login" element={<Public><Login /></Public>} />
          <Route path="/register" element={<Public><Register /></Public>} />
          <Route path="/expenses" element={<Private><Expenses /></Private>} />
          <Route path="/reports" element={<Private><Reports /></Private>} />
          <Route path="/" element={<Navigate to="/expenses" replace />} />
        </Routes>
      </Container>
    </Box>
  );
}
