import React, { useEffect, useState } from 'react';
import { validarToken } from '../utils/validarToken';
import { useNavigate } from 'react-router-dom';
import RutaMap from '../components/RutaMap';
import axios from 'axios';

const Ruta = () => {
  const navigate = useNavigate();
  const [puntos, setPuntos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    validarToken(navigate);
    obtenerPuntos();
  }, []);

  const obtenerPuntos = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/rutas/13/ruta`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      console.log(response)
      setPuntos(response.data); // Asegúrate que response.data sea el array que necesita RutaMap
    } catch (error) {
      console.error('Error al obtener los puntos de la ruta:', error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) return <div>Cargando mapa...</div>;

  return <RutaMap puntos={puntos} />;
};

export default Ruta;