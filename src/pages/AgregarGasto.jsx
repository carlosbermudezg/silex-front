import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Snackbar,
  Alert,
  IconButton,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
  Avatar,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { validarToken } from '../utils/validarToken';

const API_BASE = `${import.meta.env.VITE_API_URL}`;

const AgregarGasto = () => {
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [foto, setFoto] = useState('');
  const [preview, setPreview] = useState('');

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    validarToken(navigate);
    const fetchCategorias = async () => {
      try {
        const response = await axios.get(`${API_BASE}config/gasto-categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategorias(response.data.categorias);
      } catch (error) {
        console.error('Error al obtener las categorías:', error);
        setError('No se pudieron cargar las categorías.');
      }
    };

    fetchCategorias();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFoto(reader.result);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!descripcion.trim() || !monto || !categoria) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setError('El monto debe ser un número mayor que cero.');
      return;
    }

    const nuevoGasto = {
      descripcion: descripcion.trim(),
      monto: montoNum,
      gastoCategoryId: parseInt(categoria),
      foto, // Enviamos el campo foto
    };

    setLoading(true);

    try {
      await axios.post(`${API_BASE}caja/egreso`, nuevoGasto, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setSuccess(true);
      setError('');
      setDescripcion('');
      setMonto('');
      setCategoria('');
      setFecha(new Date().toISOString().split('T')[0]);
      setFoto('');
      setPreview('');
    } catch (error) {
      console.error('❌ Error al guardar el gasto:', error);
      setError(error.response?.data?.error || 'Error al guardar el gasto.');
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
          <Typography variant="h6" gutterBottom>
            Registrar nuevo gasto
          </Typography>

          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Descripción"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                fullWidth
                size="small"
              />

              <TextField
                label="Monto"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                type="number"
                fullWidth
                size="small"
              />

              <TextField
                select
                label="Categoría"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                fullWidth
                size="small"
              >
                {categorias.length > 0 ? (
                  categorias.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Cargando categorías...</MenuItem>
                )}
              </TextField>

              <Button variant="outlined" component="label" size="small">
                Subir factura
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>

              {preview && (
                <Avatar
                  src={preview}
                  alt="Foto del gasto"
                  variant="rounded"
                  sx={{ width: 100, height: 100, mx: 'auto' }}
                />
              )}

              <Button variant="contained" size="small" type="submit" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Guardar gasto'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          Gasto guardado correctamente
        </Alert>
      </Snackbar>

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AgregarGasto;