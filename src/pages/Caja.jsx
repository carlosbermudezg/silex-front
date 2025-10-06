import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Pagination
} from '@mui/material';
import IconApp from '../components/IconApp';
import { DoubleArrow } from '@mui/icons-material';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.locale('es');
import { useTheme } from '@mui/material/styles';

const API_BASE = `${import.meta.env.VITE_API_URL}`;

const Caja = () => {
  const [caja, setCaja] = useState({id:0});
  const [movimientos, setMovimientos] = useState([]);
  const [turno, setTurno] = useState({id: 0});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10); 
  const [totalPages, setTotalPages] = useState(0);

  const theme = useTheme()

  // Usuario logueado
  const token = localStorage.getItem('token');
  const user = jwtDecode(token);

  const red = theme.palette.red
  const green = theme.palette.green
  const gray = '#575757'
  const white = '#ffffff'

  const colorStatus = caja.estado == 'abierta' ? green : red

  // Fecha de hoy
  const fecha = dayjs();
  const diaSemana = fecha.format('dddd'); // Por ejemplo: 'lunes'
  const fechaCompleta = fecha.format('DD/MM/YYYY HH:mm');
  const capitalizar = (str) => str?.charAt(0).toUpperCase() + str?.slice(1);

  // Obtener los movimientos para la caja
  const getMovimientos = async (id, pageMov, limit) => {
    try {
      const res = await axios.get(`${API_BASE}caja/movimientos`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          turnoId : id,
          page: pageMov, // El backend espera que la página comience en 1
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
    } catch (err) {
      console.error(err);
    }
  };

  // Obtener el turno activo
  const obtenerTurno = async (id) => {
    try {
      const response = await axios.get(`${API_BASE}caja/turno/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTurno(response.data)
      await getMovimientos(response.data.id, page, 10)
    } catch (err) {
      setTurno({})
      setMovimientos([])
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await obtenerCaja();
      setLoading(false);
    };
    init();
  }, [page, rowsPerPage]);

  useEffect(()=>{
    const get = async()=>{
      await obtenerTurno(caja.id)
    }
    get()
  },[caja, page])

  return (
    <Box display="flex" flexDirection="column" alignItems="center" p={1.5} pb={8}>
      <Box sx={{width:'100%'}}>
      <Typography variant="h6" gutterBottom>
        Caja
      </Typography>
        <Box sx={{display:'flex', gap: 1, flexWrap:'wrap', justifyContent:'center'}}>
          <Button
            children={
            <Box sx={{display:'flex', alignItems:'center', width:'100%', justifyContent:'space-between', padding:2}}>
              <IconApp route='/caja.png'></IconApp>
              <Box>
              <Typography sx={{fontSize:'12px', fontWeight:'bold'}}>Caja <label style={{color:colorStatus}}>{caja.estado}</label></Typography>
              <Typography sx={{fontSize:'28px'}}>$ {caja.saldoActual}</Typography>
              </Box>
              <DoubleArrow fontSize='32px' sx={{color:colorStatus}}></DoubleArrow>
            </Box>
            }
            sx={{width:'100%', height:'130px', fontSize:'40px', padding:0, border: `0px solid ${colorStatus}`, backgroundColor:'#05112e', color: white, borderRadius: 3}} 
            variant="contained"
            onClick={() => navigate('/caja')}
          />
        </Box>
      </Box>

      <Typography variant="h6" mb={2}>
        Movimientos del Día
      </Typography>
      <Typography variant="caption">{`${capitalizar(diaSemana)}, ${fechaCompleta}`}</Typography>

      <TableContainer component={Paper} sx={{ width: '100%', borderRadius:3, padding:1, backgroundColor: theme.palette.background.default}}>
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
                  mov.tipo === 'visita' ? color = 'primary' : color = green
                  simbol = mov.monto <= 0 ? '' : '+'
                } else {
                  color = red;
                  simbol = '-';
                }
                return (
                  <TableRow key={mov.id}>
                    <TableCell sx={{width:'80%'}}>
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
                    <TableCell sx={{p:0, textAlign:'right'}}>
                      <Typography color={color} sx={{width:'100%', textAlign:'right'}} variant="caption">
                        {simbol} ${mov.monto}
                      </Typography>
                      <br />
                      <Typography color="textSecondary" variant="caption" sx={{width:'100%', textAlign:'right'}}>
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
        sx={{width:'100%', borderRadius:3, display:'flex', justifyContent:'center', border: `1px solid ${gray}`, p:1, mt:1}}
        variant='outlined'
        boundaryCount={1}
        siblingCount={0}
        shape='rounded'
        count={totalPages}
        page={page}
        onChange={(event, value) => setPage(value)}
        color= { theme.palette.background.default }
      />
    </Box>
  );
};

export default Caja;