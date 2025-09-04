import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import { Box } from '@mui/material';
import Logout from './pages/Logout';
import MainLayout from './layout/MainLayout';
import ProtectedRoutes from './components/ProtectedRoutes';
import Clientes from './pages/Clientes';
import Creditos from './pages/Creditos';
import InfoCredito from './pages/InfoCredito';
import AgregarGasto from './pages/AgregarGasto';
import Gastos from './pages/Gastos';
import Caja from './pages/Caja';
import RegistrarCliente from './pages/RegistrarCliente';
import RegistrarCredito from './pages/RegistrarCredito';
import RutaMapa from './pages/RutaMapa';
import Ruta from './pages/Ruta';
import Pagos from './pages/Pagos';
import { validarToken } from './utils/validarToken';

const App = () => {
  const [ubicacionCobrador, setUbicacionCobrador] = useState(null);
  const [isAuth, setIsAuth] = useState(validarToken())

  // Función para obtener la ubicación actual del cobrador
  const obtenerUbicacion = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUbicacionCobrador({ lat, lng });
        console.log(pos)
      },
      (pos) => {
        console.log(pos)
        alert('No se pudo obtener la ubicación actual')
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    // Obtener la ubicación inicialmente
    obtenerUbicacion();

    // Configurar el cron para actualizar la ubicación cada 5 minutos
    const intervalId = setInterval(obtenerUbicacion, 300000); // 5 minutos en milisegundos

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Actualiza isAuth cuando el token cambie
    const interval = setInterval(() => {
      setIsAuth(validarToken());
    }, 1000); // Se verifica cada segundo para mantener el estado actualizado

    return () => clearInterval(interval); // Limpia el intervalo cuando el componente se desmonte
  }, []); // Solo se ejecuta una vez al montarse


  return (
    <Box sx={{height:'100vh'}}>
      <Routes>
        <Route>
          <Route path="/" element={isAuth ? <Navigate to="/home" /> : <Login/>} />
          <Route path="/logout" element={<Logout />} />
        </Route>
        <Route element={<MainLayout />}>
          <Route element={<ProtectedRoutes isAuth={isAuth} redirectTo="/" />}>
            <Route path="/home" element={<Home />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/creditos" element={<Creditos />} />
            <Route path="/info-credito/:id" element={<InfoCredito />} />
            <Route path="/gastos" element={<Gastos />} />
            <Route path="/registro-gasto" element={<AgregarGasto />} />
            <Route path="/caja" element={<Caja />} />
            <Route path="/registrar-cliente" element={<RegistrarCliente />} />
            <Route path="/registrar-credito" element={<RegistrarCredito />} />
            <Route path="/pagos" element={<Pagos />} />
            <Route path="/rutamapa" element={<RutaMapa ubicacionCobrador={ubicacionCobrador} />} />
            <Route path="/ruta" element={<Ruta />} />
          </Route>
        </Route>
      </Routes>
    </Box>
  );
};

export default App;
