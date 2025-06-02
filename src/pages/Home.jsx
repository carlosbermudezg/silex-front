import React, { useState } from 'react';
import {
  Button,
  Stack,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Acciones rápidas
      </Typography>

      <Stack spacing={2}>
        <Button variant="contained" color="primary" onClick={() => navigate('/registrar-cliente')}>
          Registrar Cliente
        </Button>
        <Button variant="contained" color="primary" onClick={() => navigate('/registrar-credito')}>
          Registrar Crédito
        </Button>
        <Button variant="contained" color="secondary" onClick={() => navigate('/registro-gasto')}>
          Registrar Gasto
        </Button>
        {/* <Button variant="contained" color="secondary" onClick={() => navigate('/gastos')}>
          Gastos
        </Button> */}
        <Button variant="contained" color="success" onClick={() => navigate('/pagos')}>
          Comprobantes
        </Button>
        {/* <Button variant="contained" color="success" onClick={() => navigate('/ruta')}>
          Ruta
        </Button> */}
        <Button variant="contained" color="success" onClick={() => navigate('/rutamapa')}>
          Ruta Mapa
        </Button>

        {/* Botón para abrir diálogo */}
        <Box mt={3}>
          <Button
            variant="contained"
            color="error"
            fullWidth
            onClick={() => setOpenLogoutDialog(true)}
          >
            Cerrar sesión
          </Button>
        </Box>
      </Stack>

      {/* Diálogo de confirmación */}
      <Dialog open={openLogoutDialog} onClose={() => setOpenLogoutDialog(false)}>
        <DialogTitle>¿Cerrar sesión?</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas cerrar sesión?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLogoutDialog(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleLogout} color="error" variant="contained">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Home;