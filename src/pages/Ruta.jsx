import React, { useEffect, useState } from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress,
  Divider,
  TextField,
  Box,
  Dialog, DialogActions, DialogContent,
  DialogTitle,
  Pagination,
  Button, MenuItem
} from '@mui/material';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

const API_BASE = `${import.meta.env.VITE_API_URL}`;
const estadoColor = {
  aprobado: 'success',
  pendiente: 'warning',
  rechazado: 'error',
};

const Ruta = () => {
  const token = localStorage.getItem('token');
  const user = jwtDecode(token);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [puntos, setPuntos] = useState([]);
  const [render, setRender] = useState(false)
  const [cargando, setCargando] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [valorPagar, setValorPagar] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [ubicacionActual, setUbicacionActual] = useState(null);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState(null);

  console.log(puntos)

  const handleCloseModal = () => {
    setOpenModal(false);
    setValorPagar('');
    setPuntoSeleccionado(null);
  };

  const handleOpenModal = (punto) => {
    setPuntoSeleccionado(punto);
    setOpenModal(true);
  };

  const handlePagar = async() => {
    
    const pago = {
      creditoId : puntoSeleccionado.creditoId,
      valor : Number(valorPagar),
      metodoPago: metodoPago,
      location: `${ubicacionActual.lat}`+','+`${ubicacionActual.lng}`
    }

    console.log(pago)

    const response = await axios.post(`${import.meta.env.VITE_API_URL}creditos/pagar`, pago, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((response)=> {
      toast.success('Se ha registrado el pago con éxito', {position:'bottom-center'})
      setRender(!render)
    })
    .catch((error) => {
      toast.error(error.response.data.error, {position:'bottom-center'})
      console.log(error)
    })

    // Cerrar el modal después de registrar el pago
    handleCloseModal();
  };

  useEffect(() => {
    // Obtener ubicación actual
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUbicacionActual({ lat, lng });
      },
      () => alert('No se pudo obtener la ubicación actual'),
      { enableHighAccuracy: true }
    );
  }, []);

  const handleSearchChange = (e) => {
    setDescripcionFilter(e.target.value);
    setPage(1); // Reiniciar a la primera página cuando cambia el filtro
  };

  useEffect(() => {
    obtenerPuntos();
  }, [render]);

  const obtenerPuntos = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/rutas/${user.userId}/ruta`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPuntos(response.data); // Asegúrate que response.data sea el array que necesita RutaMap
    } catch (error) {
      console.error('Error al obtener los puntos de la ruta:', error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ padding: 20, paddingBottom: 70 }}>
      <Typography variant="h5" gutterBottom>
        Ruta del día
      </Typography>

      {/* Búsqueda por descripción */}
      {/* <Box sx={{ mb: 2 }}>
        <TextField
          label="Buscar por descripción"
          value=""
          onChange={handleSearchChange}
          fullWidth
          size="small"
        />
      </Box> */}

      {/* Lista de gastos */}
      {cargando ? (
        <CircularProgress />
      ) : puntos.length === 0 ? (
        <Typography variant="body1">No hay clientes por cobrar hoy.</Typography>
      ) : (
        <>
          <List>
            {puntos.map((punto) => (
              <Paper key={punto.creditoId} sx={{ mb: 1 }}>
                <ListItem
                  secondaryAction={
                    <Button
                      onClick={()=> handleOpenModal(punto)}
                      variant='contained'
                      color='success'
                      sx={{
                        color:'#fff'
                      }}
                    >
                      Pagar
                    </Button>
                  }
                >
                  <ListItemText
                    secondary={
                      <>
                        <div>{punto.nombre}</div>
                        <div>
                          Fecha:{' '}
                          {new Date(punto.fechaPago).toLocaleString('es-EC', {
                            timeZone: 'America/Guayaquil',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </div>
                        <Typography color='secondary'>Monto: ${punto.cuota.toFixed(2)}</Typography>
                        <Typography color='info'>Abonado: ${punto.monto_pagado.toFixed(2)}</Typography>
                        <Typography color='primary'>Atrasos: {punto.cuotasAtrasadas}</Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider />
              </Paper>
            ))}
          </List>

          {/* Paginación */}
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              size="small"
            />
          </Box>
        </>
      )}
      {/* Modal para registrar el pago */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Ingresar el valor a pagar</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Valor a pagar"
            type="number"
            fullWidth
            value={valorPagar}
            onChange={(e) => setValorPagar(e.target.value)}
            variant="outlined"
          />
          <TextField
              fullWidth
              select
              label="Método de pago"
              name="metodoPago"
              value={metodoPago}
              onChange={(e)=> setMetodoPago(e.target.value)}
            >
                <MenuItem key="1" value="Efectivo">
                  Efectivo
                </MenuItem>
                <MenuItem key="2" value="Transferencia">
                  Transferencia
                </MenuItem>
            </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cancelar
          </Button>
          <Button onClick={handlePagar} color="primary">
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Ruta;