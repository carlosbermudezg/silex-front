import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Switch, Box } from '@mui/material'; // Importar Switch y Box
import { Brightness7, Brightness4 } from '@mui/icons-material'; // Importar los iconos de Sol y Luna
import Login from './pages/Login';
import Home from './pages/Home';
import Logout from './pages/Logout';
import MainLayout from './layout/MainLayout';
import ProtectedRoutes from './components/ProtectedRoutes';
import Creditos from './pages/Creditos';
import InfoCredito from './pages/InfoCredito';
import AgregarGasto from './pages/AgregarGasto';
import Gastos from './pages/Gastos';
import Caja from './pages/Caja';
import RegistrarCliente from './pages/RegistrarCliente';
import RegistrarCredito from './pages/RegistrarCredito';
import Ruta from './pages/Ruta';

const App = () => {
  // Estado para el modo oscuro
  const [darkMode, setDarkMode] = useState(false);
  const [ubicacionCobrador, setUbicacionCobrador] = useState(null);

  // Configuración del tema, dinámicamente según el modo
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light', // Establecer modo claro u oscuro
    },
  });

  // Recuperar el estado del tema desde localStorage para mantener la preferencia
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setDarkMode(true);
    }
  }, []);

  // Cambiar entre modo oscuro y claro
  const toggleDarkMode = (event) => {
    const newMode = event.target.checked;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode); // Guardar la preferencia en localStorage
    window.dispatchEvent(new Event('localStorageChange'));
  };

  // Función para obtener la ubicación actual del cobrador
  const obtenerUbicacion = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUbicacionCobrador({ lat, lng });
      },
      () => alert('No se pudo obtener la ubicación actual'),
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

  // console.log(ubicacionCobrador)

  const isAuth = true; // Esto lo puedes conectar con tu lógica de autenticación

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Aplica el tema globalmente */}
      <div>
        {/* Toggle de modo oscuro y claro con iconos */}
        <Box sx={{ position: 'fixed', top: 10, right: 10, zIndex: 1000 }}>
          <Switch
            checked={darkMode}
            onChange={toggleDarkMode}
            icon={<Brightness7 />} // Icono para el modo claro (sol)
            checkedIcon={<Brightness4 />} // Icono para el modo oscuro (luna)
            sx={{
              padding: '1px', // Aplica padding para evitar que los iconos sobresalgan
            }}
          />
        </Box>

        <Routes>
          <Route>
            <Route path="/" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
          </Route>
          <Route element={<MainLayout />}>
            <Route element={<ProtectedRoutes isAuth={isAuth} redirectTo="/" />}>
              <Route path="/home" element={<Home />} />
              <Route path="/creditos" element={<Creditos />} />
              <Route path="/info-credito/:id" element={<InfoCredito />} />
              <Route path="/gastos" element={<Gastos />} />
              <Route path="/registro-gasto" element={<AgregarGasto />} />
              <Route path="/caja" element={<Caja />} />
              <Route path="/registrar-cliente" element={<RegistrarCliente />} />
              <Route path="/registrar-credito" element={<RegistrarCredito />} />
              <Route path="/ruta" element={<Ruta ubicacionCobrador={ubicacionCobrador} />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </ThemeProvider>
  );
};

export default App;
