import React, { useEffect, useState } from 'react';
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
  Autocomplete,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material';

import { ArrowBack } from '@mui/icons-material';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const API_BASE = import.meta.env.VITE_API_URL;

const RegistrarCredito = () => {
  const [form, setForm] = useState({
    rutaId: '',
    clienteId: '',
    productoId: '',
    monto: 0,
    plazo: '',
    frecuencia_pago: '',
  });

  const [rutas, setRutas] = useState([]);
  const [config, setConfig] = useState({})
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [configCreditos, setConfigCreditos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [clienteSearch, setClienteSearch] = useState('');
  const [errors, setErrors] = useState({ monto: '', plazo: '', frecuencia_pago: '' });
  const [valorCuota, setValorCuota] = useState(0);
  const [valorEntregar, setValorEntregar] = useState(0);
  const [primeraCuota, setPrimeraCuota] = useState(true);
  const [render, setRender] = useState(false)

  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const token = localStorage.getItem('token');
  const user = jwtDecode(token);

  useEffect(() => {
    fetchRutas();
  }, []);

  useEffect(()=>{
    const getValorCuota = (plazo, frecuencia)=>{
      if(plazo && frecuencia) {

        const monto = parseFloat(form.monto)+((parseFloat(form.monto) * config.interes)/100);

        if(frecuencia == 'diario'){
          const cuota = monto / plazo
          setValorCuota(cuota)
        }
        if(frecuencia == 'semanal'){
          const semanas = Math.ceil(plazo / 7)
          const cuota = monto / semanas
          setValorCuota(cuota)
        }
        if(frecuencia == 'quincenal'){
          const semanas = Math.ceil(plazo / 15)
          const cuota = monto / semanas
          setValorCuota(cuota)
        }
        if(frecuencia == 'mensual'){
          setValorCuota(monto)
        }
      }else{
        setValorCuota(0)
      }
      setRender(!render)
    }
    getValorCuota(form.plazo, form.frecuencia_pago)
  },[primeraCuota, form.monto, form.plazo, form.frecuencia_pago])

  useEffect(()=>{
    const monto = parseFloat(form.monto);
    const entrega = primeraCuota ? monto - valorCuota : monto;
    setValorEntregar(entrega);
  }, [render])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (form.rutaId) {
        fetchClientes(clienteSearch, form.rutaId);
        fetchProductosByRuta(form.rutaId);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [clienteSearch, form.rutaId]);

  const fetchRutas = async () => {
    try {
      const res = await axios.get(`${API_BASE}rutas/usuario/${user.userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, limit: 10 },
      });
      setConfig(res.data.data[0].config)
      setRutas(res.data.data);
    } catch (err) {
      console.error('Error al obtener rutas del usuario:', err);
    }
  };

  const fetchClientes = async (search = '', rutaId) => {
    if (!rutaId) return;
    setLoadingClientes(true);
    try {
      const res = await axios.get(`${API_BASE}clientes/ruta/${rutaId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, limit: 10, search },
      });
      setClientes(res.data.data);
    } catch (err) {
      console.error('Error al obtener clientes:', err);
    } finally {
      setLoadingClientes(false);
    }
  };

  const fetchProductosByRuta = async (rutaId) => {
    try {
      const res = await axios.get(`${API_BASE}productos/ruta/${rutaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductos(res.data);
    } catch (err) {
      console.error('Error al obtener productos por ruta:', err);
    }
  };

  const fetchConfigCreditos = async (rutaId) => {
    try {
      const res = await axios.get(`${API_BASE}config/ruta/${rutaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfigCreditos(res.data);
    } catch (err) {
      console.error('Error al obtener configuración de créditos:', err);
      setConfigCreditos(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedForm = {
      ...form,
      [name]: value,
      ...(name === 'rutaId' && { clienteId: '', productoId: '', frecuencia_pago: '' }),
    };

    if (name === 'monto' && configCreditos) {
      const montoVal = parseFloat(value);
      if (montoVal < configCreditos.monto_minimo || montoVal > configCreditos.monto_maximo) {
        setErrors((prev) => ({
          ...prev,
          monto: `El monto debe estar entre ${configCreditos.monto_minimo} y ${configCreditos.monto_maximo}`,
        }));
      } else {
        setErrors((prev) => ({ ...prev, monto: '' }));
      }
    }

    if (name === 'plazo' && configCreditos) {
      const plazoVal = parseInt(value);
      if (plazoVal < configCreditos.plazo_minimo || plazoVal > configCreditos.plazo_maximo) {
        setErrors((prev) => ({
          ...prev,
          plazo: `El plazo debe estar entre ${configCreditos.plazo_minimo} y ${configCreditos.plazo_maximo} días`,
        }));
      } else {
        setErrors((prev) => ({ ...prev, plazo: '' }));
      }
    }

    if (name === 'frecuencia_pago' && configCreditos) {
      const frecuencias = JSON.parse(
        '["' + configCreditos.frecuencia_pago.replace(/[{}]/g, '').replace(/,/g, '","') + '"]'
      );
      if (!frecuencias.includes(value)) {
        setErrors((prev) => ({
          ...prev,
          frecuencia_pago: `La frecuencia de pago debe ser una de las opciones: ${frecuencias.join(', ')}`,
        }));
      } else {
        setErrors((prev) => ({ ...prev, frecuencia_pago: '' }));
      }
    }

    setForm(updatedForm);

    if (name === 'rutaId') {
      fetchClientes('', value);
      fetchProductosByRuta(value);
      fetchConfigCreditos(value);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validaciones adicionales
      if (!form.rutaId || !form.clienteId || !form.productoId || !form.monto || !form.plazo || !form.frecuencia_pago) {
        setSnackbar({
          open: true,
          message: 'Todos los campos son obligatorios',
          severity: 'error',
        });
        return;
      }
  
      const { monto_minimo, monto_maximo, plazo_minimo, plazo_maximo } = configCreditos;
      const monto = parseFloat(form.monto);
      const plazo_dias = parseInt(form.plazo);
  
      // Validación de monto
      if (monto < monto_minimo || monto > monto_maximo) {
        setSnackbar({
          open: true,
          message: `El monto debe estar entre ${monto_minimo} y ${monto_maximo}`,
          severity: 'error',
        });
        return;
      }
  
      // Validación de plazo
      if (plazo_dias < plazo_minimo || plazo_dias > plazo_maximo) {
        setSnackbar({
          open: true,
          message: `El plazo debe estar entre ${plazo_minimo} y ${plazo_maximo} días`,
          severity: 'error',
        });
        return;
      }
  
      // Validación de frecuencia de pago
      const frecuenciaValida = JSON.parse(
        '["' + configCreditos.frecuencia_pago.replace(/[{}]/g, '').replace(/,/g, '","') + '"]'
      );
  
      if (!frecuenciaValida.includes(form.frecuencia_pago)) {
        setSnackbar({
          open: true,
          message: `La frecuencia de pago debe ser una de las opciones: ${frecuenciaValida.join(', ')}`,
          severity: 'error',
        });
        return;
      }
  
      const payload = {
        monto,
        plazo_dias,
        frecuencia_pago: form.frecuencia_pago,
        usuarioId: user.userId,
        clienteId: parseInt(form.clienteId),
        rutaId: parseInt(form.rutaId),
        productoId: parseInt(form.productoId),
        primeraCuota: primeraCuota
      };
  
      setLoading(true);
  
      const response = await axios.post(`${API_BASE}creditos`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (response.status === 201) {
        setSnackbar({
          open: true,
          message: 'Crédito registrado exitosamente',
          severity: 'success',
        });
  
        // Limpiar formulario después de éxito
        setForm({
          rutaId: '',
          clienteId: '',
          productoId: '',
          monto: '',
          plazo: '',
          frecuencia_pago: '',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Hubo un problema al registrar el crédito.',
          severity: 'error',
        });
      }
    } catch (err) {
      console.error('Error al registrar crédito:', err);
  
      let errorMessage = 'Error desconocido al registrar el crédito';
  
      if (err.response && err.response.data) {
        errorMessage = err.response.data.error || err.message;
      }
  
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
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
          zIndex: 999,
          backgroundColor: isDarkMode ? theme.palette.background.paper : '#fff',
          boxShadow: 1,
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack />
        </IconButton>
      </Box>

      <Card sx={{ mt: 8, mb: 4 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Registrar Crédito
          </Typography>

          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              fullWidth
              select
              label="Ruta"
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

            <Autocomplete
              disabled={!form.rutaId}
              options={clientes}
              getOptionLabel={(option) => option.nombres || ''}
              value={clientes.find((c) => c.id === form.clienteId) || null}
              inputValue={clienteSearch}
              onInputChange={(_, value) => setClienteSearch(value)}
              onChange={(_, value) =>
                setForm((prev) => ({
                  ...prev,
                  clienteId: value ? value.id : '',
                }))
              }
              filterOptions={(x) => x}
              loading={loadingClientes}
              renderInput={(params) => <TextField {...params} label="Seleccionar Cliente" fullWidth />}
            />

            <TextField
              fullWidth
              select
              label="Producto"
              name="productoId"
              value={form.productoId}
              onChange={handleChange}
            >
              {productos.map((producto) => (
                <MenuItem key={producto.id} value={producto.id}>
                  {producto.nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Monto"
              name="monto"
              value={form.monto}
              onChange={handleChange}
              type="number"
              error={Boolean(errors.monto)}
              helperText={errors.monto}
              inputProps={{ min: 0, step: '0.01' }}
            />
            {
              <Typography variant='caption'> Total crédito: ${parseFloat(form.monto)+((parseFloat(form.monto) * config.interes)/100)}</Typography>
            }

            <TextField
              fullWidth
              label="Plazo en días"
              name="plazo"
              value={form.plazo}
              onChange={handleChange}
              type="number"
              error={Boolean(errors.plazo)}
              helperText={errors.plazo}
              inputProps={{ min: 1 }}
            />

            <TextField
              fullWidth
              select
              label="Frecuencia de pago"
              name="frecuencia_pago"
              value={form.frecuencia_pago}
              onChange={handleChange}
              disabled={!configCreditos}
              error={Boolean(errors.frecuencia_pago)}
              helperText={errors.frecuencia_pago}
            >
              {(configCreditos && configCreditos.frecuencia_pago ?
                JSON.parse('["' + configCreditos.frecuencia_pago.replace(/[{}]/g, '').replace(/,/g, '","') + '"]') : []
              ).map((frecuencia) => (
                <MenuItem key={frecuencia} value={frecuencia}>
                  {frecuencia}
                </MenuItem>
              ))}
            </TextField>
            <FormGroup>
              <FormControlLabel control={<Checkbox checked={primeraCuota} onClick={ ()=> setPrimeraCuota(!primeraCuota) } />} label="Abonar primera cuota" />
            </FormGroup>
            {
              (form.plazo && form.frecuencia_pago) && <Typography variant='caption'> Valor de cuota: ${ valorCuota }</Typography>
            }
            {
              <Typography variant='caption'> Valor a entregar: ${ valorEntregar }</Typography>
            }

            <Button variant="contained" fullWidth onClick={handleSubmit} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Guardar Crédito'}
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

export default RegistrarCredito;