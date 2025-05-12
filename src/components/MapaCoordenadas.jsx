import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

// Iconos personalizados desde CDN
const casaIcon = new L.Icon({
  iconUrl: 'home.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const cobroIcon = new L.Icon({
  iconUrl: 'destination.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Componente de marcador reutilizable
const DraggableMarker = ({ icon, position, onChange, markerRef }) => {
  const [markerPos, setMarkerPos] = useState(position);

  const eventHandlers = {
    dragend(e) {
      const latlng = e.target.getLatLng();
      setMarkerPos([latlng.lat, latlng.lng]);
      onChange(`${latlng.lat},${latlng.lng}`);
    },
  };

  useEffect(() => {
    if (markerRef.current) {
      // Actualizar la posición del marcador si cambian las coordenadas
      markerRef.current.setLatLng(position);
    }
  }, [position, markerRef]);

  return (
    <Marker
      draggable
      position={markerPos}
      icon={icon}
      eventHandlers={eventHandlers}
      ref={markerRef} // Asignamos el ref al marcador
    />
  );
};

const MapaCoordenadas = ({ valueCasa, valueCobro, onChangeCasa, onChangeCobro }) => {
  const [coords, setCoords] = useState([10, -84]); // Valor genérico por defecto
  const mapRef = useRef(); // Referencia para el mapa de Leaflet
  const casaMarkerRef = useRef(); // Referencia para el marcador de casa
  const cobroMarkerRef = useRef(); // Referencia para el marcador de cobro

  useEffect(() => {
    // Obtener la ubicación del usuario al cargar
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const userCoords = [lat, lng];
        setCoords(userCoords); // Establecemos las coordenadas de ubicación del usuario

        // Si no hay valores iniciales, establecemos los dos
        if (!valueCasa) onChangeCasa(`${lat},${lng}`);
        if (!valueCobro) onChangeCobro(`${lat},${lng}`);
      },
      () => {}
    );
  }, []);

  // Coordenadas de la casa y de la dirección de cobro
  const casaPos = valueCasa ? valueCasa.split(',').map(Number) : coords;
  const cobroPos = valueCobro ? valueCobro.split(',').map(Number) : coords;

  useEffect(() => {
    if (mapRef.current) {
      // Centrar el mapa cuando las coordenadas del usuario cambian
      mapRef.current.setView(coords, 16);
    }
  }, [coords]); // Se ejecuta cuando las coordenadas cambian

  return (
    <MapContainer
      center={coords} // Usamos las coordenadas del usuario para centrar el mapa
      zoom={16}
      scrollWheelZoom={true}
      style={{ height: 250, width: '100%', marginTop: 8 }}
      ref={mapRef} // Asignamos la referencia al mapa
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Marcador para la casa */}
      <DraggableMarker 
        position={casaPos} 
        icon={casaIcon} 
        onChange={onChangeCasa} 
        markerRef={casaMarkerRef} // Pasamos la referencia para el marcador de casa
      />
      {/* Marcador para la dirección de cobro */}
      <DraggableMarker 
        position={cobroPos} 
        icon={cobroIcon} 
        onChange={onChangeCobro} 
        markerRef={cobroMarkerRef} // Pasamos la referencia para el marcador de cobro
      />
    </MapContainer>
  );
};

export default MapaCoordenadas;