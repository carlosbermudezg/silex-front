import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
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
  TablePagination
} from '@mui/material';
import axios from 'axios';
import { validarToken } from '../utils/validarToken';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0); // Página actual
  const [rowsPerPage, setRowsPerPage] = useState(10); // Establecemos 10 registros por defecto
  const [totalPages, setTotalPages] = useState(0); // Total de páginas
  const navigate = useNavigate();

  // Usuario logueado
  const token = localStorage.getItem('token');
  const user = jwtDecode(token);

  // Fecha de hoy
  const fecha = dayjs();
  const diaSemana = fecha.format('dddd'); // Por ejemplo: 'lunes'
  const fechaCompleta = fecha.format('DD/MM/YYYY HH:mm');
  const capitalizar = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // Obtener los movimientos para la caja
  const getMovimientos = async (cajaId, page, limit) => {
    const fechaHoy = dayjs().format('YYYY-MM-DD'); // Capturamos la fecha de hoy en formato YYYY-MM-DD
    try {
      const res = await axios.get(`${API_BASE}caja/movimientos`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          cajaId,
          fechaInicio: fechaHoy,
          fechaFin: fechaHoy,
          page: page + 1, // El backend espera que la página comience en 1
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
      setCaja(response.data);
      await getMovimientos(response.data.id, page, rowsPerPage);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      validarToken(navigate);
      setLoading(true);
      await obtenerCaja();
      setLoading(false);
    };
    init();
  }, [page, rowsPerPage]); // Ejecutar cuando cambie la página o las filas por página

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
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
                Saldo: <strong>${caja.saldoActual.toFixed(2)}</strong>
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
                    <TableCell>{mov.descripcion}</TableCell>
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

      <TablePagination
        component="div"
        count={totalPages * rowsPerPage} // Total de registros: totalPages * rowsPerPage
        page={page}
        onPageChange={(e, newPage) => {
          setPage(newPage);
          getMovimientos(caja.id, newPage, rowsPerPage);
        }}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          const newLimit = parseInt(e.target.value, 10);
          setRowsPerPage(newLimit);
          setPage(0);
          getMovimientos(caja.id, 0, newLimit);
        }}
        rowsPerPageOptions={[10, 25]} // Limita a solo 10 o 25
        localeText={{
          labelRowsPerPage: 'Filas por página',
          labelDisplayedRows: ({ from, to, count }) => `${from}-${to} de ${count}`,
          firstAriaLabel: 'Primera página',
          lastAriaLabel: 'Última página',
          nextAriaLabel: 'Siguiente página',
          previousAriaLabel: 'Página anterior',
        }}
      />
    </Box>
  );
};

export default Caja;