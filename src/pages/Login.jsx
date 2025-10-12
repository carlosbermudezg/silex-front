// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Button, Paper, TextField, Typography, Divider, Link } from '@mui/material';
import { MailOutline, LockOutline, Google, Facebook, Face } from '@mui/icons-material';
import toast from 'react-hot-toast';
import Logo from '../components/Logo'
import { useTheme } from '@mui/material/styles';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

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
      backgroundColor: theme.palette.background.default,
      boxSizing: 'border-box',
      padding: 2,
    }}
    >
      <Paper elevation={3}
        sx={{
          width: '100%',
          padding: 4,
          borderRadius: 2,
          boxShadow: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Logo></Logo>
          <Typography variant="caption" align="center">
            Ingresa tus datos para iniciar sesión.
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          <Typography variant='caption'>Usuario</Typography>
          <Box sx={{ width:'100%', display:'flex', border: `1px solid ${theme.palette.textField.superior}`, borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ display:'flex', padding: 1, backgroundColor: theme.palette.textField.main, justifyContent:'center', alignItems:'center'}}>
            <MailOutline></MailOutline>
          </Box>
            <TextField
              size='small'
              type="email"
              sx={{
                '& .MuiInputBase-input': {
                  caretColor: theme.palette.textField.cursor, // color del cursor
                  backgroundColor: theme.palette.textField.main
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: theme.palette.textField.border, // color normal
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.textField.border,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.textField.border,
                  },
                },
              }}
              placeholder='Ingresa tu usuario'
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          <Typography variant='caption'>Contraseña</Typography>
          <Box sx={{ width:'100%', display:'flex', border: `1px solid ${theme.palette.textField.superior}`, borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ display:'flex', padding: 1, backgroundColor: theme.palette.textField.main, justifyContent:'center', alignItems:'center'}}>
            <LockOutline></LockOutline>
          </Box>
          <TextField
            size='small'
            type="password"
            sx={{
              '& .MuiInputBase-input': {
                caretColor: theme.palette.textField.cursor, // color del cursor
                backgroundColor: theme.palette.textField.main
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: theme.palette.textField.border, // color normal
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.textField.border,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.textField.border,
                },
              },
            }}
            placeholder='Ingresa tu contraseña'
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          </Box>
        </Box>
        <Button
          variant="contained"
          fullWidth
          sx={{
            mt: 2,
            p:1,
            borderRadius: 2,
            backgroundColor: theme.palette.button.main,
            color: theme.palette.button.text
          }}
          onClick={handleLogin}
        >
          Iniciar Sesión
        </Button>
        {/* <Link align='center' mt={3} color={ theme.palette.text.link } href="#">Olvidé mi contraseña</Link> */}
      </Paper>
    </Box>
  );
}

export default Login;