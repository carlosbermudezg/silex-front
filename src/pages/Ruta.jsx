import React, { useEffect, useState } from 'react';
import RutaMapa from './RutaMapa';
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
  Button, MenuItem, Chip, Skeleton
} from '@mui/material';
import PropTypes, { element } from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const Ruta = () => {
  const token = localStorage.getItem('token');
  const user = jwtDecode(token);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [puntos, setPuntos] = useState([]);
  const [results, setResults] = useState([])
  const [search, setSearch] = useState('')
  const [render, setRender] = useState(false)
  const [cargando, setCargando] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [valorPagar, setValorPagar] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [ubicacionActual, setUbicacionActual] = useState(null);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState(null);
  const theme = useTheme()

  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

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
    setSearch(e.target.value)
    const res = puntos.filter( element => element.nombre.toLowerCase().includes(e.target.value.toLowerCase()))
    setResults(res)
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
      setPuntos(response.data);
      setResults(response.data);
    } catch (error) {
      console.error('Error al obtener los puntos de la ruta:', error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', color: '#fff' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Listado" {...a11yProps(0)} sx={{ '&.Mui-selected': { color: 'red' }  }} />
          <Tab label="Mapa" {...a11yProps(1)} sx={{ '&.Mui-selected': { color: 'red' }  }} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Typography variant="h5" gutterBottom>
          Ruta del día
        </Typography>

        {/* Búsqueda por descripción */}
        <Box sx={{ mb: 1}}>
          <TextField
            label="Buscar por cliente"
            value={search}
            onChange={handleSearchChange}
            fullWidth
            size="small"
            color='info'
          />
        </Box>

        {/* Lista de gastos */}
        {cargando ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {
              [1,2,3,4,5].map((element, index)=>{
                return(
                  <Skeleton key={index} variant="rounded" sx={{
                    width: '100%',
                    height: 100
                  }} /> 
                )
              })
            }
          </Box>
        ) : puntos.length === 0 ? (
          <Typography variant="body1">No hay clientes por cobrar hoy.</Typography>
        ) : (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              paddingBottom: 8
            }}>
              {results.map((punto) => {
                const cuotasAtraso = punto.cuotasAtrasadas
                let color = theme.palette.green
                if (cuotasAtraso >= 2) {
                  color = theme.palette.orange
                }
                if (cuotasAtraso >= 3) {
                  color = theme.palette.red
                }
                return(
                  <Box key={punto.creditoId}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 1,
                      border: `1px solid ${theme.palette.border}`,
                      borderRadius: 3,
                      backgroundColor: theme.palette.primary.main
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant='body1'>{punto.nombre}</Typography>
                      <Typography variant='caption'>
                        Fecha:{' '}
                        {new Date(punto.fechaPago).toLocaleString('es-EC', {
                          timeZone: 'America/Guayaquil',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant='caption'>Monto de la cuota: </Typography>
                        <Typography variant='caption' color='info'> ${punto.cuota.toFixed(2)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant='caption'>Abonado: </Typography>
                        <Typography variant='caption' color='success'> ${punto.monto_pagado.toFixed(2)}</Typography>
                      </Box>
                      <Box>
                        <Typography variant='caption' color='text'>Cuotas atrasadas: </Typography>
                        <Chip label={punto.cuotasAtrasadas} sx={{backgroundColor: color, fontSize: 12}} size='small' />
                      </Box>
                    </Box>
                    <Button
                      onClick={()=> handleOpenModal(punto)}
                      variant='contained'
                      size='small'
                      color='success'
                      sx={{
                        color:'#fff',
                        height: 35
                      }}
                    >
                      Pagar
                    </Button>
                  </Box>
                )
              })}
            </Box>
        )}
        {/* Modal para registrar el pago */}
        <Dialog open={openModal} onClose={handleCloseModal}
          slotProps={{
            paper: {
              sx: {
                backgroundColor: theme.palette.background.default,
                color: 'white',   // opcional, para que el texto contraste,
                width: '90%'
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
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <RutaMapa></RutaMapa>
      </CustomTabPanel>
    </Box>
  );
};

export default Ruta;