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
  Chip,
  Pagination,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = `${import.meta.env.VITE_API_URL}`;
const estadoColor = {
  aprobado: 'success',
  pendiente: 'warning',
  rechazado: 'error',
};

const Ruta = () => {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [descripcionFilter, setDescripcionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchGastosDelDia = async (pageNumber = 1, search = '') => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE}caja/egresos-dia?page=${pageNumber}&limit=${limit}&search=${search}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const gastosHoy = response.data.data || [];
      setGastos(gastosHoy);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error('Error al cargar los gastos del día:', err);
      setGastos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGastosDelDia(page, descripcionFilter);
  }, [page, descripcionFilter]);

  const handleSearchChange = (e) => {
    setDescripcionFilter(e.target.value);
    setPage(1); // Reiniciar a la primera página cuando cambia el filtro
  };

  return (
    <div style={{ padding: 20, paddingBottom: 70 }}>
      <Typography variant="h5" gutterBottom>
        Ruta del día
      </Typography>

      {/* Búsqueda por descripción */}
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Buscar por descripción"
          value={descripcionFilter}
          onChange={handleSearchChange}
          fullWidth
          size="small"
        />
      </Box>

      {/* Lista de gastos */}
      {loading ? (
        <CircularProgress />
      ) : gastos.length === 0 ? (
        <Typography variant="body1">No hay gastos registrados hoy.</Typography>
      ) : (
        <>
          <List>
            {gastos.map((gasto) => (
              <Paper key={gasto.id} sx={{ mb: 1 }}>
                <ListItem
                  secondaryAction={
                    <Chip
                      label={gasto.estado}
                      color={estadoColor[gasto.estado?.toLowerCase()] || 'default'}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  }
                >
                  <ListItemText
                    primary={gasto.descripcion}
                    secondary={
                      <>
                        <div>Monto: ${gasto.monto}</div>
                        <div>
                          Fecha:{' '}
                          {new Date(gasto.createdAt).toLocaleString('es-EC', {
                            timeZone: 'America/Guayaquil',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })}
                        </div>
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
    </div>
  );
};

export default Ruta;