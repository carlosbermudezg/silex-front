import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  MenuItem,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import MapaCoordenadas from '../components/MapaCoordenadas';
import { jwtDecode } from 'jwt-decode';

const API_BASE = import.meta.env.VITE_API_URL;

const RegistrarCliente = () => {
  const [form, setForm] = useState({
    nombres: '',
    telefono: '',
    direccion: '',
    identificacion: '',
    rutaId: '',
    coordenadasCasa: '',
    coordenadasCobro: '',
    fotos: [],
  });

  const theme = useTheme();

  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = jwtDecode(token);

  // Obtener ubicación al iniciar
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
        setForm((prev) => ({
          ...prev,
          coordenadasCasa: coords,
          coordenadasCobro: coords,
        }));
      },
      (err) => console.error('Error obteniendo ubicación:', err),
      { enableHighAccuracy: true }
    );
  }, []);

  // Obtener rutas del usuario
  const fetchRutas = async () => {
    try {
      const res = await axios.get(`${API_BASE}rutas/usuario/${user.userId}?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRutas(res.data.data);
    } catch (err) {
      console.error('Error cargando rutas:', err);
    }
  };

  useEffect(() => {
    fetchRutas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const base64Array = await Promise.all(
      files.map((file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
      )
    );
    setForm((prev) => ({ ...prev, fotos: base64Array }));
  };

  const resetForm = () => {
    setForm({
      nombres: '',
      telefono: '',
      direccion: '',
      identificacion: '',
      rutaId: '',
      coordenadasCasa: '',
      coordenadasCobro: '',
      fotos: [],
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE}clientes`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setSnackbar({
        open: true,
        message: 'Cliente registrado exitosamente',
        severity: 'success',
      });

      resetForm();
    } catch (err) {
      console.log(err)
      const msg = err.response.data.error || 'Error al guardar cliente';
      setSnackbar({
        open: true,
        message: msg,
        severity: 'error',
      });
      console.error('Error al guardar cliente:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={2}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          gap: 3,
          zIndex: 999,
          backgroundColor: theme.palette.background.default,
          borderBottom: `1px solid ${ theme.palette.border }`,
          height: '60px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack />
        </IconButton>
        <Typography variant='h6'>Registrar Cliente</Typography>
      </Box>

      <Card sx={{ 
        mb: 8,
        backgroundColor: theme.palette.background.default
      }}>
        <CardContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant='caption'>Nombres: *</Typography>
            <TextField size='small' color='info' fullWidth label="Ingresa los nombres completos" name="nombres" value={form.nombres} onChange={handleChange} />
            <Typography variant='caption'>Teléfono: *</Typography>
            <TextField size='small' color='info' fullWidth label="Ingresa el número de teléfono" name="telefono" value={form.telefono} onChange={handleChange} />
            <Typography variant='caption'>Dirección: *</Typography>
            <TextField size='small' color='info' fullWidth label="Ingresa la dirección del domicilio" name="direccion" value={form.direccion} onChange={handleChange} />
            <Typography variant='caption'>Identificación: *</Typography>
            <TextField size='small' color='info' fullWidth label="Ingresa el número de identificación" name="identificacion" value={form.identificacion} onChange={handleChange} />
            <Typography variant='caption'>Ruta: *</Typography>
            <TextField
              size='small'
              fullWidth
              select
              label="Selecciona una ruta"
              color='info'
              name="rutaId"
              value={form.rutaId}
              onChange={handleChange}
            >
              {rutas.map((ruta) => (
                <MenuItem key={ruta.id} value={ruta.id}>
                  {ruta.nombre}
                </MenuItem>
              ))}
            </TextField>
            <Typography variant='caption'>Fotos: *</Typography>
            <Button variant="outlined" component="label" sx={ { backgroundColor: theme.palette.red, color: "#fff", border: `1px solid ${ theme.palette.border }` } }>
              Seleccionar Fotos
              <input hidden type="file" accept="image/*" multiple onChange={handleFileChange} />
            </Button>
            <Typography variant="caption">{form.fotos.length} fotos seleccionadas</Typography>
            <Box>
              <Typography variant="subtitle2" mb={1}>
                Ubicaciones
              </Typography>
              <MapaCoordenadas
                valueCasa={form.coordenadasCasa}
                valueCobro={form.coordenadasCobro}
                onChangeCasa={(val) => setForm((prev) => ({ ...prev, coordenadasCasa: val }))}
                onChangeCobro={(val) => setForm((prev) => ({ ...prev, coordenadasCobro: val }))}
              />
            </Box>

            <Button color='button' sx={ { color: '#fff' } } variant="contained" fullWidth onClick={handleSubmit} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Guardar Cliente'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegistrarCliente;