import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useTheme } from '@mui/material/styles';
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
  Chip,
} from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = `${import.meta.env.VITE_API_URL}`;

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('')
  const theme = useTheme();

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem('token');
  const user = jwtDecode(token);
  const navigate = useNavigate();

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}clientes/ruta/${user.ruta[0].id}?page=${page}&limit=${limit}&search=${search}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClientes(res.data.data)
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error al cargar créditos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const get = async()=>{
      await fetchClientes();
    }
    get();
  }, [page, search]);

  return (
    <div style={{ padding: 20, paddingBottom: 70 }}>
      <Typography variant="h5" gutterBottom>
        Listado de clientes
      </Typography>

      <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <TextField
          label="Buscar por cliente"
          value={search}
          color='info'
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          size="small"
        />
      </Box>

      {loading ? (
        <CircularProgress />
      ) : clientes.length === 0 ? (
        <Typography variant="body1">No hay créditos para mostrar.</Typography>
      ) : (
        <List>
          {clientes.map((cliente) => {
            return(
            <Paper key={cliente.id} sx={{ mb: 1, position: 'relative',backgroundColor: theme.palette.background.primary }}>
              <ListItem>
                <ListItemText
                  primary={`${cliente.nombres}`}
                  secondary={
                    <>
                      <label>Dni: { cliente.identificacion }</label><br />
                      <label>Dirección: {cliente.direccion}</label><br />
                      <label>Teléfono: {cliente.telefono}</label><br />
                      <label>Buró Interno: {cliente.buro}</label>
                    </>
                  }
                />
              </ListItem>
            </Paper>
          )})}
        </List>
      )}

      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={totalPages}
          page={page}
          size='small'
          onChange={(event, value) => setPage(value)}
          color="primary"
        />
      </Box>
    </div>
  );
};

export default Clientes;