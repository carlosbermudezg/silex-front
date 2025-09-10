import React, { useState, useEffect } from 'react';
import {
  Button,
  Typography,
  Box
} from '@mui/material';
import { DoubleArrow } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import IconApp from '../components/IconApp';
import dayjs from 'dayjs';

const API_BASE = `${import.meta.env.VITE_API_URL}`; // Cambia según tu IP

const Home = () => {
  const navigate = useNavigate();
  const [caja, setCaja] = useState({});

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

  const red = '#ec407a'
  const blue = '#2196f3'
  const purple = '#ba68c8'
  const green = '#81c784'
  const gray = '#9e9e9e'
  const white = '#ffffff'

  const colorStatus = caja.estado == 'abierta' ? green : red

  const actions = [
    {
      name: 'Nuevo Cliente',
      icon: '/cliente.png',
      color: green,
      textColor: white,
      link: '/registrar-cliente'
    },
    {
      name: 'Nuevo Crédito',
      icon: '/credito.png',
      color: green,
      textColor: white,
      link: '/registrar-credito'
    },
    {
      name: 'Nuevo Gasto',
      icon: '/gastos.png',
      color: blue,
      textColor: white,
      link: '/registro-gasto'
    },
    {
      name: 'Comprobantes',
      icon: '/comprobante.png',
      color: blue,
      textColor: white,
      link: '/pagos'
    },
    // {
    //   name: 'Enrutamiento',
    //   icon: '/lista.png',
    //   color: red,
    //   textColor: white,
    //   link: '/ruta'
    // },
    {
      name: 'Ruta',
      icon: '/ruta3.png',
      color: red,
      textColor: white,
      link: '/rutamapa'
    }
  ]

  // Fecha de hoy
  const fecha = dayjs();
  const diaSemana = fecha.format('dddd'); // Por ejemplo: 'lunes'
  const fechaCompleta = fecha.format('DD/MM/YYYY HH:mm');
  const capitalizar = (str) => str?.charAt(0).toUpperCase() + str?.slice(1);

  return (
    <Box sx={{ p: 1.5, height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', gap:1 }}>
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
      <Box sx={{width:'100%'}}>
      <Typography variant="h6" gutterBottom>
        Acciones rápidas
      </Typography>
        <Box sx={{display:'flex', gap: 1, flexWrap:'wrap', justifyContent:'center'}}>
          {
            actions.map((element, index)=>{
              return(
                <Button
                  key={index}
                  children={<Box sx={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                    <IconApp route={element.icon}></IconApp>
                    <Typography sx={{fontSize:'12px'}}>{element.name}</Typography>
                  </Box>} 
                  sx={{width:'47%', height:'100px', fontSize:'40px', padding:0, backgroundColor:'#505254', color: element.textColor, borderRadius: 3}} 
                  variant="contained"
                  onClick={() => navigate(element.link)} 
                />
              )
            })
          }
          {/* <Button
            children={<Box sx={{display:'flex', flexDirection:'column', alignItems:'center'}}>
              <Logout fontSize='32px'></Logout>
              <Typography sx={{fontSize:'12px'}}>Cerrar Sesion</Typography>
            </Box>} 
            sx={{width:'47%', height:'100px', fontSize:'40px', padding:0, backgroundColor:'#ec407a'}} 
            variant="contained" 
            color="error" 
            onClick={() => setOpenLogoutDialog(true)}
          /> */}
        </Box>
      </Box>
      <Box sx={{width:'100%', display:'flex', flexDirection:'column', alignItems:'center', paddingTop:4}}>
        <Typography variant='caption' color={gray}>Bienvenido, Banka 4</Typography>
        <Typography variant="caption" color={gray}>{`${capitalizar(diaSemana)}, ${fechaCompleta}`}</Typography>
      </Box>
    </Box>
  );
};

export default Home;