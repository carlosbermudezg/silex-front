import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, useTheme } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material'; // Icono de X

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
const getMarkerColor = (cuotasAtrasadas) => {
  if (cuotasAtrasadas > 6) return '#f33232';
  if (cuotasAtrasadas > 3) return '#e8e147';
  return '#65c129';
};

const RutaMap = ({ puntos }) => {
  const [rutaOrdenada, setRutaOrdenada] = useState([]);
  const [ubicacionActual, setUbicacionActual] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [valorPagar, setValorPagar] = useState('');
  const [puntoSeleccionado, setPuntoSeleccionado] = useState(null); // Guardar el punto seleccionado para el pago
  const [boxVisible, setBoxVisible] = useState(false); // Controlar visibilidad del Box flotante
  const [boxContent, setBoxContent] = useState(null); // Contenido del Box flotante
  const mapRef = useRef();
  const theme = useTheme(); // Obtener el tema actual

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
    if (ubicacionActual && puntos.length > 0) {
      // Excluimos la ubicación actual del listado de puntos para la numeración
      const puntosSinUbicacion = puntos.map(punto => ({ ...punto }));
      const orden = ordenarPorCercania(puntosSinUbicacion, ubicacionActual);
      setRutaOrdenada(orden);
    }
  }, [ubicacionActual, puntos]);

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

  const handlePagar = () => {
    // Aquí iría la lógica para registrar el pago, por ejemplo, enviarlo al backend
    console.log(`Pago de ${valorPagar} registrado para ${puntoSeleccionado.nombre}`);

    // Cerrar el modal después de registrar el pago
    handleCloseModal();
  };

  const handleMarkerClick = (punto) => {
    setBoxContent(
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }} >
        {/* Información de Nombre y Cuota en el lado izquierdo */}
        <div style={{ flex: 1 }}>
          <div><strong>Nombre: </strong>{punto.nombre}</div>
          <div><strong>Cuota: </strong>${punto.cuota}</div>
          <div><strong>Atrasos: </strong>{punto.cuotasAtrasadas} {punto.cuotasAtrasadas === 1 ? 'cuota' : 'cuotas'}</div>
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
        {rutaOrdenada.slice(1).map((punto, index) => {
          const markerColor = getMarkerColor(punto.cuotasAtrasadas); // Obtener el color según las cuotas atrasadas

          return (
            <Marker
              key={index}
              position={[punto.lat, punto.lng]}
              icon={createNumberedIcon(index + 1, markerColor)} // Usar el color adecuado
              eventHandlers={{
                click: () => handleMarkerClick(punto),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]}>
                {punto.nombre} - ${punto.cuota}
              </Tooltip>
            </Marker>
          );
        })}

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