// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import toast from 'react-hot-toast';
import Logo from '../components/Logo'

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if(email == '' || password == '') {
      return toast.error('Los campos no pueden estar vacíos', { duration: 1000, position: 'bottom-center', });
    }
    // Mostrar el toast de carga
    const loadingToast = toast.loading('Iniciando sesión...', {
      position: 'bottom-center',
      duration: 1000, // El toast permanecerá hasta que se cierre manualmente
    });
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}login/user`, { email, password })
      localStorage.setItem('token', res.data.token);
      if(res.data.loginCon === 'codigo_seguridad'){
        window.location.href = 'https://www.youtube.com';
      }else if(res.data.loginCon === 'password'){
        navigate('/home');
      }
      toast.success('Inicio de sesión exitoso!', { id: loadingToast, duration: 1000, position: 'bottom-center', });
    } catch (err) {
      toast.error('Credenciales inválidas', { id: loadingToast, duration: 1000, position: 'bottom-center', });
    }
  };

  return (
    <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100dvh',
      overflow: 'hidden',
      backgroundColor: '#1a1a1aff',
      boxSizing: 'border-box',
      padding: 2,
    }}
    >
      <Paper elevation={3}
        sx={{
          width: '100%',
          maxWidth: 380,
          padding: 4,
          borderRadius: 2,
          boxShadow: 3,
          overflow: 'hidden',
          backgroundColor: 'background.paper',
        }}
      >
        <Logo></Logo>
        <Typography variant="body1" component="h2" align="center" gutterBottom>
          Iniciar sesión
        </Typography>

        <TextField
          size='small'
          label="Usuario"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          size='small'
          label="Contraseña"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleLogin}
        >
          Entrar
        </Button>
      </Paper>
    </Box>
  );
}

export default Login;