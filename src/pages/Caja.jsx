import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Pagination
} from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/es'; // Para español
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.locale('es'); // Establece el idioma

const API_BASE = `${import.meta.env.VITE_API_URL}`; // Cambia según tu IP

const Caja = () => {
  const [caja, setCaja] = useState({});
  const [movimientos, setMovimientos] = useState([]);
  const [turno, setTurno] = useState({id: 0});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1); // Página actual
  const [rowsPerPage, setRowsPerPage] = useState(10); // Establecemos 10 registros por defecto
  const [totalPages, setTotalPages] = useState(0); // Total de páginas

  // Usuario logueado
  const token = localStorage.getItem('token');
  const user = jwtDecode(token);

  // Fecha de hoy
  const fecha = dayjs();
  const diaSemana = fecha.format('dddd'); // Por ejemplo: 'lunes'
  const fechaCompleta = fecha.format('DD/MM/YYYY HH:mm');
  const capitalizar = (str) => str?.charAt(0).toUpperCase() + str?.slice(1);

  // Obtener los movimientos para la caja
  const getMovimientos = async (id, page, limit) => {
    try {
      const res = await axios.get(`${API_BASE}caja/movimientos`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          turnoId : id,
          page: page, // El backend espera que la página comience en 1
          limit,
        },
      });
      setMovimientos(res.data.data); // Los movimientos de la página actual
      setTotalPages(res.data.totalPages); // Total de páginas
    } catch (err) {
      console.error(err);
    }
  };

  // Obtener el estado de la caja
  const obtenerCaja = async () => {
    try {
      const response = await axios.get(`${API_BASE}caja/user/${user.userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await obtenerTurno(response.data.id)
      setCaja(response.data);
      await getMovimientos(response.data.id, page, rowsPerPage);
    } catch (err) {
      console.error(err);
    }
  };

  // Obtener el estado de la caja
  const obtenerTurno = async (id) => {
    try {
      const response = await axios.get(`${API_BASE}caja/turno/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTurno(response.data)
    } catch (err) {
      setTurno({})
      setMovimientos([])
      setEgresosTurno([])
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await obtenerCaja();
      setLoading(false);
    };
    init();
  }, [page, rowsPerPage]); // Ejecutar cuando cambie la página o las filas por página

  useEffect(()=>{
    const get = async()=>{
      await getMovimientos(turno.id, page, 10)
    }
    get()
  },[page, turno])

  return (
    <Box display="flex" sx={{marginBottom:10}} flexDirection="column" alignItems="center" mt={5}>
      <Card sx={{ minWidth: 300, width: '90%', maxWidth: 600, mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Estado de la Caja
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : (
            <>
              <Typography color={caja.estado === 'abierta' ? 'green' : 'error'}>
                <strong>{capitalizar(caja.estado)}</strong>
              </Typography>
              <Typography>
                Saldo: <strong>${caja.saldoActual}</strong>
              </Typography>
            </>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      <Typography variant="h6" mb={2}>
        Movimientos del Día
      </Typography>
      <Typography variant="caption">{`${capitalizar(diaSemana)}, ${fechaCompleta}`}</Typography>

      <TableContainer component={Paper} sx={{ width: '90%', maxWidth: 1000 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Descripción</TableCell>
              <TableCell>Monto</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movimientos.length > 0 ? (
              movimientos.map((mov) => {
                let color, simbol;
                if (mov.category === 'ingreso') {
                  color = 'success';
                  simbol = '+';
                } else {
                  color = 'error';
                  simbol = '-';
                }
                return (
                  <TableRow key={mov.id}>
                    <TableCell>
                      <Typography variant='caption'>{mov.descripcion}</Typography>
                      <br />
                      <Typography variant='caption'>
                        {new Date(mov.createdAt).toLocaleString('es-EC', {
                          timeZone: 'America/Guayaquil',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography color={color} variant="caption">
                        {simbol} ${mov.monto}
                      </Typography>
                      <br />
                      <Typography color="textSecondary" variant="caption">
                        ${mov.saldo}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay movimientos hoy
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
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
  );
};

export default Caja;