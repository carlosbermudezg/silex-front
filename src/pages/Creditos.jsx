import React, { useEffect, useState } from 'react';
import {
  Typography,
  TextField,
  Box,
  Button,
  IconButton,
  CircularProgress,
  Pagination,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { validarToken } from '../utils/validarToken';
import axios from 'axios';

const API_BASE = `${import.meta.env.VITE_API_URL}`;

const Creditos = () => {
  const [creditos, setCreditos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [clienteFilter, setClienteFilter] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const fetchCreditos = async (pagina = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}creditos/creditos-impagos?page=${pagina}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data.data;
      const pages = res.data.totalPages || 1;

      const transformados = data.map((credito) => ({
        id: credito.id,
        clienteNombre: credito.cliente?.nombres || 'Sin nombre',
        clienteApellido: credito.cliente?.apellidos || '',
        monto: credito.monto,
        estado: credito.estado,
        createdAt: credito.createdAt,
        detalles: credito,
      }));

      setCreditos(transformados);
      setFiltered(transformados);
      setTotalPages(pages);
    } catch (error) {
      console.error('Error al cargar créditos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    validarToken(navigate);
    fetchCreditos(page);
  }, [page]);

  const filtrarCreditos = () => {
    let resultado = [...creditos];

    if (clienteFilter.trim() !== '') {
      resultado = resultado.filter((c) =>
        c.clienteNombre.toLowerCase().includes(clienteFilter.toLowerCase())
      );
    }

    if (fechaDesde) {
      resultado = resultado.filter((c) => new Date(c.createdAt) >= new Date(fechaDesde));
    }

    if (fechaHasta) {
      resultado = resultado.filter((c) => new Date(c.createdAt) <= new Date(fechaHasta));
    }

    setFiltered(resultado);
  };

  const limpiarFiltros = () => {
    setClienteFilter('');
    setFechaDesde('');
    setFechaHasta('');
    setFiltered(creditos);
  };

  // MODIFICADO: Enviamos el objeto completo por state
  const handleVerDetalle = (credito) => {
    navigate(`/info-credito/${credito.id}`, { state: credito });
  };

  return (
    <div style={{ padding: 20, paddingBottom: 70 }}>
      <Typography variant="h5" gutterBottom>
        Créditos otorgados
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <TextField
          label="Buscar por cliente"
          value={clienteFilter}
          onChange={(e) => setClienteFilter(e.target.value)}
          fullWidth
          size="small"
        />
        <TextField
          label="Desde"
          type="date"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <TextField
          label="Hasta"
          type="date"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <Box display="flex" gap={1}>
          <Button variant="contained" size="small" onClick={filtrarCreditos} fullWidth>
            Aplicar
          </Button>
          <Button variant="outlined" size="small" onClick={limpiarFiltros} fullWidth>
            Limpiar
          </Button>
        </Box>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : filtered.length === 0 ? (
        <Typography variant="body1">No hay créditos para mostrar.</Typography>
      ) : (
        <List>
          {filtered.map((credito) => (
            <Paper key={credito.id} sx={{ mb: 1, position: 'relative', paddingTop: '32px' }}>
              <IconButton
                onClick={() => handleVerDetalle(credito)}
                sx={{ position: 'absolute', top: 4, left: 4 }}
              >
                <InfoOutlined />
              </IconButton>
              <ListItem>
                <ListItemText
                  primary={`Cliente: ${credito.clienteNombre}`}
                  secondary={
                    <>
                      <div>Monto: ${credito.monto}</div>
                      <div>Fecha: {new Date(credito.createdAt).toLocaleDateString()}</div>
                      <div>Estado: {credito.estado}</div>
                    </>
                  }
                />
              </ListItem>
              <Divider />
            </Paper>
          ))}
        </List>
      )}

      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(event, value) => setPage(value)}
          color="primary"
        />
      </Box>
    </div>
  );
};

export default Creditos;