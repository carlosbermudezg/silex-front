import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, useTheme, MenuItem } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material'; // Icono de X
import axios from 'axios';
import toast from 'react-hot-toast';

// Icono numerado dinámicamente
const createNumberedIcon = (number, color) =>
  new L.DivIcon({
    html: `<div style="background:${color};color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;">${number}</div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
});

// Función greedy para ordenar por cercanía desde un punto inicial
const ordenarPorCercania = (puntos, ubicacionInicial) => {
  if (puntos.length === 0) return [];

  const orden = [];
  const usados = new Set();
  let actual = ubicacionInicial; // Iniciar desde la ubicación actual
  orden.push(actual);

  const puntosRestantes = puntos.slice();

  while (orden.length < puntos.length + 1) {
    let minDist = Infinity;
    let siguiente = null;
    let idx = -1;

    for (let i = 0; i < puntosRestantes.length; i++) {
      const dist = L.latLng(actual.lat, actual.lng).distanceTo(L.latLng(puntosRestantes[i].lat, puntosRestantes[i].lng));
      if (dist < minDist) {
        minDist = dist;
        siguiente = puntosRestantes[i];
        idx = i;
      }
    }

    if (siguiente) {
      orden.push(siguiente);
      usados.add(idx);
      actual = siguiente;
      puntosRestantes.splice(idx, 1);
    }
  }

  return orden;
};

// Función para determinar el color del marcador basado en las cuotas atrasadas
const getMarkerColor = async (fechaPago) => {
  const config = await getConfigDefault();
  const atraso = calcularDiasAtraso(fechaPago)
  if (atraso >= config.days_to_red) return '#f33232';
  if (atraso >= config.days_to_yellow) return '#e8e147';
  return '#65c129';
};

const getConfigDefault = async ()=>{
  const token = localStorage.getItem('token');
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/config/default`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data
}

function calcularDiasAtraso(fechaPago) {
  const fechaPagoDate = new Date(fechaPago);
  const fechaActual = new Date();

  // Resetear horas para comparar solo fechas (opcional)
  fechaPagoDate.setHours(0, 0, 0, 0);
  fechaActual.setHours(0, 0, 0, 0);

  const milisegundosPorDia = 1000 * 60 * 60 * 24;
  const diferenciaEnMilisegundos = fechaActual - fechaPagoDate;
  const diasAtraso = Math.floor(diferenciaEnMilisegundos / milisegundosPorDia);

  // Si la fecha de pago es en el futuro, no hay atraso
  return diasAtraso > 0 ? diasAtraso : 0;
}

const RutaMap = ({ render, setRender, puntos }) => {
  const [rutaOrdenada, setRutaOrdenada] = useState([]);
  const [renderMap, setRenderMap] = useState(false)
  const [rutaOrdenadaConColor, setRutaOrdenadaConColor] = useState([]);
  const [ubicacionActual, setUbicacionActual] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [valorPagar, setValorPagar] = useState('');
  const [metodoPago, setMetodoPago] = useState('')
  const [puntoSeleccionado, setPuntoSeleccionado] = useState(null); // Guardar el punto seleccionado para el pago
  const [boxVisible, setBoxVisible] = useState(false); // Controlar visibilidad del Box flotante
  const [boxContent, setBoxContent] = useState(null); // Contenido del Box flotante
  const mapRef = useRef();
  const theme = useTheme(); // Obtener el tema actual
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Obtener ubicación actual
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUbicacionActual({ lat, lng });
      },
      () => alert('No se pudo obtener la ubicación actual'),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    const asignarColores = async () => {
      const nuevaRuta = await Promise.all(
        rutaOrdenada.map(async (punto) => {
          const markerColor = await getMarkerColor(punto.fechaPago);
          return { ...punto, markerColor };
        })
      );
      setRutaOrdenadaConColor(nuevaRuta);
    };
  
    if (rutaOrdenada.length >= 0) {
      asignarColores();
    }
  }, [rutaOrdenada]);
  

  useEffect(() => {
    if (ubicacionActual && puntos.length >= 0) {
      // Excluimos la ubicación actual del listado de puntos para la numeración
      const puntosSinUbicacion = puntos.map(punto => ({ ...punto }));
      const orden = ordenarPorCercania(puntosSinUbicacion, ubicacionActual);
      setRutaOrdenada(orden);
      console.log('renderMap')
    }
  }, [ubicacionActual, puntos, renderMap]);

  useEffect(() => {
    if (ubicacionActual && mapRef.current) {
      // Cuando la ubicación actual está disponible, centramos el mapa
      mapRef.current.setView([ubicacionActual.lat, ubicacionActual.lng], 15);
    }
  }, [ubicacionActual]);

  const handleOpenModal = (punto) => {
    setPuntoSeleccionado(punto);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setValorPagar('');
    setPuntoSeleccionado(null);
    setBoxVisible(false); // Cerrar el Box flotante al cerrar el modal
  };

  const handlePagar = async() => {
    
    const pago = {
      creditoId : puntoSeleccionado.creditoId,
      valor : Number(valorPagar),
      metodoPago: metodoPago,
      location: `${ubicacionActual.lat}`+','+`${ubicacionActual.lng}`
    }

    const response = 
    await axios.post(`${import.meta.env.VITE_API_URL}creditos/pagar`, pago, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((response)=> {
      toast.success('Se ha registrado el pago con éxito', {position:'bottom-center'})
      setRender(!render)
      setTimeout(()=>{
        setRenderMap(!renderMap)
      },1500)
    })
    .catch((error) => {
      toast.error(error.response.data.error, {position:'bottom-center'})
      console.log(error)
    })

    // Cerrar el modal después de registrar el pago
    handleCloseModal();
  };

  const handleMarkerClick = (punto) => {
    setBoxContent(
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }} >
        {/* Información de Nombre y Cuota en el lado izquierdo */}
        <div style={{ flex: 1 }}>
          <div><strong>Nombre: </strong>{punto.nombre}</div>
          <div><strong>Cuota: </strong>${punto.cuota.toFixed(2)}</div>
          <div><strong>Abonado: </strong>${punto.monto_pagado.toFixed(2)}</div>
          <div><strong>Atrasos: </strong>{punto.cuotasAtrasadas} {punto.cuotasAtrasadas === 1 ? 'cuota' : 'cuotas'}</div>
          <div><strong>Fecha: </strong>{punto.fechaPago.split("T")[0]}</div>
        </div>

        {/* Botón Pagar al lado derecho */}
        <button
          style={{
            padding: '5px 10px',
            backgroundColor: theme.palette.primary.main, // Adaptar al tema
            color: theme.palette.common.white, // Adaptar al tema
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginLeft: '10px', // Añadir espacio entre la información y el botón
          }}
          onClick={(e) => {
            e.stopPropagation(); // Evitar que el clic cierre el Box
            handleOpenModal(punto);
          }}
        >
          Pagar
        </button>
      </div>
    );
    setBoxVisible(true); // Mostrar el Box flotante
  };

  const handleMapClick = () => {
    setBoxVisible(false); // Ocultar el Box flotante si se hace clic fuera del marcador
  };

  const handleCloseBox = () => {
    setBoxVisible(false); // Cerrar el Box flotante al hacer clic en el icono de cierre
  };

  return (
    <div style={{ position: 'relative' }}>
      <MapContainer
        center={[10, -84]}
        zoom={15}
        style={{ height: '100vh', width: '100%' }}
        ref={mapRef}
        onClick={handleMapClick} // Cerrar el Box flotante cuando se haga clic fuera
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Marcadores para la ubicación actual */}
        {ubicacionActual && (
          <Marker
            position={[ubicacionActual.lat, ubicacionActual.lng]}
            icon={new L.Icon({ iconUrl: 'motorcycle.png', iconSize: [32, 32] })}
          >
            <Tooltip>Ubicación Actual</Tooltip>
          </Marker>
        )}

        {/* Marcadores para las paradas de la ruta (excluyendo la ubicación actual) */}
        {rutaOrdenadaConColor.slice(1).map((punto, index) => (
          <Marker
          key={index}
          position={[punto.lat, punto.lng]}
          icon={createNumberedIcon(index + 1, punto.markerColor)}
          eventHandlers={{
            click: () => handleMarkerClick(punto),
          }}
          >
          <Tooltip direction="top" offset={[0, -10]}>
            {punto.nombre} - ${punto.cuota}
          </Tooltip>
          </Marker>
        ))}


        {/* Traza la ruta (incluyendo la ubicación actual) */}
        {rutaOrdenada.length > 1 && (
          <Polyline
            positions={[ [ubicacionActual.lat, ubicacionActual.lng], ...rutaOrdenada.slice(1).map((p) => [p.lat, p.lng]) ]}
            color="blue"
          />
        )}
      </MapContainer>

      {/* Box flotante en la esquina inferior derecha */}
      {boxVisible && (
        <div
          style={{
            position: 'absolute',
            bottom: '120px', // Margen para no cubrir el bottomNav
            left: '0',
            width: '100%',
            backgroundColor: theme.palette.background.paper, // Adaptar al tema
            padding: '15px',
            boxShadow: theme.shadows[5], // Adaptar al tema
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            opacity: 0.85
          }}
        >
          {/* Botón para cerrar el Box */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <button
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={handleCloseBox}
            >
              <CloseIcon style={{ fontSize: 24, color: theme.palette.text.primary }} />
            </button>
          </div>

          {boxContent}
        </div>
      )}

      {/* Modal para registrar el pago */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Ingresar el valor a pagar</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Valor a pagar"
            type="number"
            fullWidth
            value={valorPagar}
            onChange={(e) => setValorPagar(e.target.value)}
            variant="outlined"
          />
          <TextField
              fullWidth
              select
              label="Método de pago"
              name="metodoPago"
              value={metodoPago}
              onChange={(e)=> setMetodoPago(e.target.value)}
            >
                <MenuItem key="1" value="Efectivo">
                  Efectivo
                </MenuItem>
                <MenuItem key="2" value="Transferencia">
                  Transferencia
                </MenuItem>
            </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cancelar
          </Button>
          <Button onClick={handlePagar} color="primary">
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RutaMap;