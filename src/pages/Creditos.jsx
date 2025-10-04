import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
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

const Creditos = () => {
  const [creditos, setCreditos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({})

  const [clienteFilter, setClienteFilter] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem('token');
  const user = jwtDecode(token);
  const verCredito = user.permisos.includes('viewcr')
  const navigate = useNavigate();

  const obtenerDiasAtraso = (cuotas) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Ignorar hora
  
    // Filtrar cuotas impagas cuya fecha ya pasó
    const impagasVencidas = cuotas.filter(c => {
      const fecha = new Date(c.fecha_pago);
      fecha.setHours(0, 0, 0, 0);
      return c.estado === "impago" && fecha < hoy;
    });
  
    if (impagasVencidas.length === 0) {
      return 0;
    }
  
    const masAtrasada = impagasVencidas.reduce((masVieja, actual) => {
      const f1 = new Date(masVieja.fecha_pago);
      const f2 = new Date(actual.fecha_pago);
      f1.setHours(0, 0, 0, 0);
      f2.setHours(0, 0, 0, 0);
      return f2 < f1 ? actual : masVieja;
    });
  
    const fechaCuota = new Date(masAtrasada.fecha_pago);
    fechaCuota.setHours(0, 0, 0, 0); // Ignorar hora
  
    const msPorDia = 1000 * 60 * 60 * 24;
    const diasAtraso = Math.floor((hoy - fechaCuota) / msPorDia);
  
    return diasAtraso;
  };  

  const getConfigDefault = async ()=>{
    await axios.get(`${import.meta.env.VITE_API_URL}/config/default`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((response)=>{
      setConfig(response.data)
    }).catch((error)=>{
      toast.error('Fallo de configuración')
    })
  }

  const fetchCreditos = async (pagina = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}creditos/creditos-impagos?page=${pagina}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data.data;
      const pages = res.data.pagination.totalPages || 1;

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
    const get = async()=>{
      await getConfigDefault();
      await fetchCreditos(page);
    }
    get();
  }, [page]);

  // MODIFICADO: Enviamos el objeto completo por state
  const handleVerDetalle = (credito) => {
    navigate(`/info-credito/${credito.id}`, { state: {credito, configDefault: config} });
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
      </Box>

      {loading ? (
        <CircularProgress />
      ) : filtered.length === 0 ? (
        <Typography variant="body1">No hay créditos para mostrar.</Typography>
      ) : (
        <List>
          {filtered.map((credito) => {
            const diasAtraso = obtenerDiasAtraso(credito.detalles.cuotas)
            let color = 'success'
            if (diasAtraso >= config.days_to_yellow) {
              color = 'warning'
            }
            if (diasAtraso >= config.days_to_red) {
              color ='error'
            }

            return(
            <Paper key={credito.id} sx={{ mb: 1, position: 'relative' }}>
              {
                verCredito &&
                <IconButton
                  onClick={() => handleVerDetalle(credito)}
                  sx={{ position: 'absolute', top: 2, right: 2, zIndex:1 }}
                  color='primary'
                >
                  <InfoOutlined />
                </IconButton>
              }
              <ListItem>
                <ListItemText
                  primary={`${credito.clienteNombre}`}
                  secondary={
                    <>
                      <label>Saldo: $ {credito.detalles.saldo}</label><br />
                      <label>Fecha: {new Date(credito.createdAt).toLocaleDateString()}</label><br />
                      <label>Estado: {credito.estado}</label>
                    </>
                  }
                />
              </ListItem>
              <div style={{position:'absolute', right: 7, bottom: 7}}>
                <Typography variant='caption' color='textDisabled'>Dias Atraso: <Chip label={diasAtraso} color={color} size='small' /></Typography>
              </div>
            </Paper>
          )})}
        </List>
      )}

      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          sx={{width:'280px', marginTop:1, display:'flex', justifyContent:'center'}}
            variant='outlined'
            boundaryCount={1}
            siblingCount={0}
            shape='rounded'
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