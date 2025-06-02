import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RutaMap from '../components/RutaMap';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const RutaMapa = () => {
  const navigate = useNavigate();
  const [puntos, setPuntos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [render, setRender] = useState(false)
  const token = localStorage.getItem('token');
  const user = jwtDecode(token);

  useEffect(() => {
    obtenerPuntos();
  }, [render]);

  const obtenerPuntos = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/rutas/${user.userId}/ruta`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPuntos(response.data); // Asegúrate que response.data sea el array que necesita RutaMap
    } catch (error) {
      console.error('Error al obtener los puntos de la ruta:', error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) return <div>Cargando mapa...</div>;

  return <RutaMap setRender={setRender} render={render} puntos={puntos} />;
};

export default RutaMapa;