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
        <Typography variant='h6'>Registrar nuevo gasto</Typography>
      </Box>

      <Card sx={{ 
        mt: 4, 
        mb: 4,
        backgroundColor: theme.palette.background.default 
      }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant='caption'>Descripción: *</Typography>
              <TextField
                label="Ingresa una descripción"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                fullWidth
                size="small"
              />
              <Typography variant='caption'>Monto: *</Typography>
              <TextField
                label="Ingresa un monto"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                type="number"
                fullWidth
                size="small"
              />
              <Typography variant='caption'>Categoría: *</Typography>
              <TextField
                select
                label="Selecciona una categoría"
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