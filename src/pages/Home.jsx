import React, { useState, useEffect } from 'react';
import {
  Button,
  Typography,
  Box,
  Divider
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
  const [dataDash, setDataDash] = useState({});
  const [morosos, setMorosos] = useState(0);
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

  // Obtener el dashboard
  const getDataDash = async()=>{
    try {
      const res = await axios.get(`${API_BASE}creditos/datadash?id=${user.ruta[0].id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDataDash(res.data)
      const altoRiesgo = Number(res.data.creditos_alto_riesgo)
      const vencidos = Number(res.data.creditos_vencidos)
      const morosos = altoRiesgo + vencidos
      setMorosos(morosos)
    } catch (err) {
      console.log(err)
      setDataDash({
        "total_impagos": "0",
        "cartera": "0",
        "creditos_alto_riesgo": "0",
        "creditos_vencidos": "0",
        "creditos_atrasados": "0",
        "creditos_al_dia": "0",
        "cartera_alto_riesgo": null,
        "cartera_vencidos": "0",
        "cartera_atrasados": null,
        "monto_a_recaudar_hoy": "0",
        "cartera_al_dia": null,
        "saldo_caja": "0",
        "turno_id": null,
        "recaudacion": "0",
        "gastos": "0"
    })
    }
  }

  useEffect(() => {
      const init = async () => {
        await obtenerCaja();
        await getDataDash();
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
            <Typography variant='h5' sx={{ color: theme.palette.green }}>{dataDash.total_impagos}</Typography>
          </Box>} 
          sx={{width:'48%', height:'100px', padding:1, borderRadius: 3, border: `1px solid ${borderColor}`}} 
          variant="contained"
        />
        <Button
          children={
          <Box sx={{display:'flex', flexDirection:'column', alignItems:'center'}}>
            <AttachMoney></AttachMoney>
            <Typography variant='subtitle2'>Cobros pendientes</Typography>
            <Typography variant='h5' color='warning'>$ {dataDash.monto_a_recaudar_hoy}</Typography>
          </Box>} 
          sx={{width:'48%', height:'100px', padding:1, borderRadius: 3, border: `1px solid ${borderColor}`}} 
          variant="contained"
        />
      </Box>
      <Box sx={{width:'100%', display:'flex', gap: 1, flexWrap:'wrap', justifyContent:'center'}}>
        <Button
          children={
          <Box sx={{ display:'flex', justifyContent:'space-around', gap:2 }}>
            <Box sx={{display:'flex', flexDirection:'column', alignItems:'center'}}>
              <Typography variant='caption'>Al día</Typography>
              <Typography variant='h5' sx={{ color: theme.palette.green }}>{dataDash.creditos_al_dia}</Typography>
            </Box>
            <Box sx={{display:'flex', flexDirection:'column', alignItems:'center'}}>
              <Typography variant='caption'>Atrasados</Typography>
              <Typography variant='h5' sx={{ color: theme.palette.info.main }}>{dataDash.creditos_atrasados}</Typography>
            </Box>
            <Box sx={{display:'flex', flexDirection:'column', alignItems:'center'}}>
              <Typography variant='caption'>Alto riesgo</Typography>
              <Typography variant='h5' sx={{ color: theme.palette.orange }}>{dataDash.creditos_alto_riesgo}</Typography>
            </Box>
            <Box sx={{display:'flex', flexDirection:'column', alignItems:'center'}}>
              <Typography variant='caption'>Vencidos</Typography>
              <Typography variant='h5' sx={{ color: theme.palette.red }}>{dataDash.creditos_vencidos}</Typography>
            </Box>
          </Box>
          } 
          sx={{width:'100%', height:'100px', padding:1, borderRadius: 3, border: `1px solid ${borderColor}`}} 
          variant="contained"
        />
      </Box>
      <Box sx={{width:'100%', display:'flex', gap: 1, flexWrap:'wrap', justifyContent:'center'}}>
        <Button
          children={
            <Box sx={{ display:'flex', width:'100%', justifyContent:'space-around' }}>  
              <Box sx={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                <MonetizationOn></MonetizationOn>
                <Typography variant='subtitle2'>Recaudación del día</Typography>
                <Typography variant='h5' sx={{ color: theme.palette.green }}>$ {dataDash.recaudacion}</Typography>
              </Box>
              <Box sx={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                <MoneyOff></MoneyOff>
                <Typography variant='subtitle2'>Gastos del día</Typography>
                <Typography variant='h5' sx={{ color: theme.palette.red }}>$ {dataDash.gastos}</Typography>
              </Box>
            </Box>
          } 
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