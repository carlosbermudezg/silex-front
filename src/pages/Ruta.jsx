import React, { useEffect, useState } from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress,
  TextField,
  Box,
  Dialog, DialogActions, DialogContent,
  DialogTitle,
  Pagination,
  Button, MenuItem, Chip
} from '@mui/material';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';

const Ruta = () => {
  const token = localStorage.getItem('token');
  const user = jwtDecode(token);
  const [loading, setLoading] = useState(false);
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
  const theme = useTheme()

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
    setLoading(true)
    const pago = {
      creditoId : puntoSeleccionado.creditoId,
      valor : Number(valorPagar),
      metodoPago: metodoPago,
      location: `${ubicacionActual.lat}`+','+`${ubicacionActual.lng}`
    }

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

    setLoading(false)
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
      {/* <Box sx={{ mb: 1}}>
        <TextField
          label="Buscar por cliente"
          value=""
          onChange={handleSearchChange}
          fullWidth
          size="small"
          color='info'
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
            {puntos.map((punto) => {
              const cuotasAtraso = punto.cuotasAtrasadas
              let color = theme.palette.green
              if (cuotasAtraso >= 2) {
                color = theme.palette.orange
              }
              if (cuotasAtraso >= 3) {
                color = theme.palette.red
              }
              return(
                <Paper 
                  key={punto.creditoId} 
                  sx={{ 
                    mb: 1,
                    backgroundColor: theme.palette.background.default
                    }}
                >
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
                          <Typography variant='body2' color='secondary'>Monto de la cuota: ${punto.cuota.toFixed(2)}</Typography>
                          <Typography variant='body2' color='info'>Abonado: ${punto.monto_pagado.toFixed(2)}</Typography>
                          <Typography variant='body2' color='text'>Cuotas atrasadas: <Chip label={punto.cuotasAtrasadas} sx={{backgroundColor: color}} size='small' /></Typography>
                        </>
                      }
                    />
                  </ListItem>
                </Paper>
              )
            })}
          </List>

          {/* Paginación */}
          {/* <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              size="small"
            />
          </Box> */}
        </>
      )}
      {/* Modal para registrar el pago */}
      <Dialog open={openModal} onClose={handleCloseModal}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: theme.palette.background.default,
              color: 'white',   // opcional, para que el texto contraste,
              width: '70%'
            },
          },
        }}
      >
        <DialogTitle>Ingresar el valor a pagar</DialogTitle>
        <DialogContent sx={{display:'flex', flexDirection:'column', gap:1}}>
          <TextField
            autoFocus
            margin="dense"
            label="Valor a pagar"
            type="number"
            fullWidth
            value={valorPagar}
            onChange={(e) => setValorPagar(e.target.value)}
            variant="outlined"
            color='info'
            size='small'
          />
          <TextField
              fullWidth
              select
              label="Método de pago"
              name="metodoPago"
              value={metodoPago}
              onChange={(e)=> setMetodoPago(e.target.value)}
              color='info'
              size='small'
            >
                <MenuItem key="1" value="Efectivo">
                  Efectivo
                </MenuItem>
                <MenuItem key="2" value="Transferencia">
                  Transferencia
                </MenuItem>
            </TextField>
        </DialogContent>
        <DialogActions sx={{display:'flex', paddingRight: 3}}>
          <Button onClick={handleCloseModal} color="error" variant='outlined'>
            Cancelar
          </Button>
          <Button disabled={ loading } onClick={handlePagar} color="info" variant='outlined'>
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Ruta;