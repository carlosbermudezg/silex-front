import React, { useState, useEffect } from 'react';
import {
  Button,
  Typography,
  Box
} from '@mui/material';
import { AttachMoney, CreditCard, DoubleArrow, MonetizationOn, MoneyOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import IconApp from '../components/IconApp';
import dayjs from 'dayjs';
import { useTheme } from '@mui/material/styles';

const API_BASE = `${import.meta.env.VITE_API_URL}`; // Cambia según tu IP

const Home = () => {
  const navigate = useNavigate();
  const [caja, setCaja] = useState({});
  const theme = useTheme();
  // Usuario logueado
  const token = localStorage.getItem('token');
  const user = jwtDecode(token);

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

  useEffect(() => {
      const init = async () => {
        await obtenerCaja();
      };
      init();
  }, []); // Ejecutar cuando cambie la página o las filas por página

  const red = theme.palette.red
  const green = theme.palette.green
  const borderColor = theme.palette.border

  const colorStatus = caja.estado == 'abierta' ? green : red

  const actions = [
    {
      name: 'Añadir Cliente',
      icon: '/cliente.png',
      title : 'Registra un nuevo cliente',
      link: '/registrar-cliente'
    },
    {
      name: 'Nuevo Crédito',
      icon: '/credito.png',
      title : 'Otorga un nuevo crédito',
      link: '/registrar-credito'
    },
    {
      name: 'Nuevo Gasto',
      icon: '/gastos.png',
      title : 'Agrega un nuevo gasto',
      link: '/registro-gasto'
    },
    {
      name: 'Comprobantes',
      icon: '/comprobante.png',
      title : 'Ver los últimos pagos',
      link: '/pagos'
    },
    {
      name: 'Ruta de Cobro',
      icon: '/lista.png',
      title : 'Ruta de cobros del día',
      link: '/ruta'
    },
    {
      name: 'Ruta',
      icon: '/ruta3.png',
      title : 'Ruta de cobros del día',
      link: '/rutamapa'
    }
  ]

  // Fecha de hoy
  const fecha = dayjs();
  const diaSemana = fecha.format('dddd'); // Por ejemplo: 'lunes'
  const fechaCompleta = fecha.format('DD/MM/YYYY HH:mm');
  const capitalizar = (str) => str?.charAt(0).toUpperCase() + str?.slice(1);

  return (
    <Box sx={{ p: 1.5, display:'flex', flexDirection:'column', alignItems:'center', gap: 2 }}>
      <Box sx={{width:'100%'}}>
        <Box sx={{display:'flex', gap: 1, flexWrap:'wrap', justifyContent:'center'}}>
          <Button
            children={
            <Box sx={{display:'flex', alignItems:'center', width:'100%', justifyContent:'space-between', padding:2}}>
              <IconApp route='/caja.png'></IconApp>
              <Box>
              <Typography sx={{fontSize:'12px', fontWeight:'bold', textTransform:'uppercase'}}>Caja <label style={{color:colorStatus}}>{caja.estado}</label></Typography>
              <Typography sx={{fontSize:'28px'}}>$ {caja.saldoActual}</Typography>
              </Box>
              <DoubleArrow fontSize='32px' sx={{color:colorStatus}}></DoubleArrow>
            </Box>
            }
            sx={{width:'100%', height:'130px', fontSize:'40px', padding:0, border: `1px solid ${borderColor}`, borderRadius: 3}} 
            variant="contained"
            onClick={() => navigate('/caja')}
          />
        </Box>
      </Box>
      <Box sx={{width:'100%', display:'flex', gap: 1, flexWrap:'wrap', justifyContent:'space-between'}}>
        <Button
          children={
          <Box sx={{display:'flex', flexDirection:'column', alignItems:'center'}}>
            <CreditCard></CreditCard>
            <Typography variant='subtitle2'>Créditos activos</Typography>
            <Typography variant='h5' sx={{ color: theme.palette.green }}>56</Typography>
          </Box>} 
          sx={{width:'48%', height:'100px', padding:1, borderRadius: 3, border: `1px solid ${borderColor}`}} 
          variant="contained"
        />
        <Button
          children={
          <Box sx={{display:'flex', flexDirection:'column', alignItems:'center'}}>
            <AttachMoney></AttachMoney>
            <Typography variant='subtitle2'>Cobros pendientes</Typography>
            <Typography variant='h5' color='warning'>$ 358.00</Typography>
          </Box>} 
          sx={{width:'48%', height:'100px', padding:1, borderRadius: 3, border: `1px solid ${borderColor}`}} 
          variant="contained"
        />
      </Box>
      <Box sx={{width:'100%', display:'flex', gap: 1, flexWrap:'wrap', justifyContent:'center'}}>
        <Button
          children={
          <Box sx={{display:'flex', flexDirection:'column', alignItems:'center'}}>
            <MonetizationOn></MonetizationOn>
            <Typography variant='subtitle2'>Recaudación del día</Typography>
            <Typography variant='h5' sx={{ color: theme.palette.green }}>$ 12000.00</Typography>
          </Box>} 
          sx={{width:'100%', height:'100px', padding:1, borderRadius: 3, border: `1px solid ${borderColor}`}} 
          variant="contained"
        />
      </Box>
      <Box sx={{width:'100%', display:'flex', gap: 1, flexWrap:'wrap', justifyContent:'center'}}>
        <Button
          children={
          <Box sx={{display:'flex', flexDirection:'column', alignItems:'center'}}>
            <MoneyOff></MoneyOff>
            <Typography variant='subtitle2'>Gastos del día</Typography>
            <Typography variant='h5' sx={{ color: theme.palette.red }}>$ 124.50</Typography>
          </Box>} 
          sx={{width:'100%', height:'100px', padding:1, borderRadius: 3, border: `1px solid ${borderColor}`}} 
          variant="contained"
        />
      </Box>
      <Box sx={{width:'100%'}}>
        <Box sx={{display:'flex', gap: 1, flexWrap:'wrap', justifyContent:'space-between'}}>
          {
            actions.map((element, index)=>{
              return(
                <Button
                  key={index}
                  children={
                  <Box sx={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                    <IconApp route={element.icon}></IconApp>
                    <Typography variant='subtitle2'>{element.name}</Typography>
                    <Typography variant='caption' color='textDisabled'>{element.title}</Typography>
                  </Box>} 
                  sx={{width:'48%', height:'100px', padding:1, borderRadius: 3, border: `1px solid ${borderColor}`}} 
                  variant="contained"
                  onClick={() => navigate(element.link)} 
                />
              )
            })
          }
        </Box>
      </Box>
      <Box sx={{width:'100%', display:'flex', flexDirection:'column', alignItems:'center', marginBottom: 10, marginTop: 5}}>
        <Typography variant='caption'>Bienvenido, {user.name}</Typography>
        <Typography variant='caption'>{`${capitalizar(diaSemana)}, ${fechaCompleta}`}</Typography>
      </Box>
    </Box>
  );
};

export default Home;