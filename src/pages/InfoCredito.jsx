import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Divider,
  Grid,
  useTheme,
  Snackbar,
  Alert,
  Pagination,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { ArrowBack, Image as ImageIcon } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { validarToken } from '../utils/validarToken';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const InfoCredito = () => {
  const { state: credito } = useLocation();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagePagos, setPagePagos] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const cuotasPorPagina = 5;
  const pagosPorPagina = 5;

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

   useEffect(()=>{
      validarToken(navigate)
    },[])

  if (!credito) {
    return (
      <Box p={2}>
        <Typography variant="h6">No se proporcionó información del crédito.</Typography>
        <Button variant="contained" onClick={() => navigate(-1)}>Volver</Button>
      </Box>
    );
  }

  const cuotas = credito.detalles.cuotas || [];
  const pagos = credito.pagos || [];

  const cuotasFiltradas = filtroEstado === 'todos'
    ? cuotas
    : cuotas.filter((cuota) => cuota.estado === filtroEstado);

  const totalPagesCuotas = Math.ceil(cuotasFiltradas.length / cuotasPorPagina);
  const cuotasPaginadas = cuotasFiltradas.slice((page - 1) * cuotasPorPagina, page * cuotasPorPagina);

  const totalPagesPagos = Math.ceil(pagos.length / pagosPorPagina);
  const pagosPaginados = pagos.slice((pagePagos - 1) * pagosPorPagina, pagePagos * pagosPorPagina);

  return (
    <Box p={2}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 999,
          backgroundColor: isDarkMode ? theme.palette.background.paper : '#fff',
          boxShadow: 1,
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack />
        </IconButton>
      </Box>

      <Card sx={{ mt: 8 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Información del Crédito
          </Typography>
          <Typography><strong>Cliente:</strong> {credito.clienteNombre} {credito.clienteApellido}</Typography>
          <Typography><strong>Teléfono:</strong> {credito.detalles.cliente?.telefono}</Typography>
          <Typography><strong>Dirección:</strong> {credito.detalles.cliente?.direccion}</Typography>
          <Typography><strong>Identificación:</strong> {credito.detalles.cliente?.identificacion}</Typography>
          <Typography><strong>Producto:</strong> {credito.detalles.producto?.nombre}</Typography>
          <Typography><strong>Monto:</strong> ${credito.monto}</Typography>
          <Typography><strong>Interés:</strong> {credito.detalles.interes}%</Typography>
          <Typography><strong>Plazo:</strong> {credito.detalles.plazo} días</Typography>
          <Typography><strong>Frecuencia:</strong> {credito.detalles.frecuencia_pago}</Typography>
          <Typography><strong>Estado:</strong> {credito.estado}</Typography>
          <Typography><strong>Fecha creación:</strong> {new Date(credito.createdAt).toLocaleDateString()}</Typography>
          <Typography><strong>Vencimiento:</strong> {new Date(credito.detalles.fechaVencimiento).toLocaleDateString()}</Typography>

          <Divider sx={{ my: 2 }} />

          {/* Cuotas */}
          <Typography variant="subtitle1" gutterBottom>Cuotas</Typography>

          <FormControl size="small" sx={{ mb: 2, minWidth: 180 }}>
            <InputLabel>Filtrar por estado</InputLabel>
            <Select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setPage(1);
              }}
              label="Filtrar por estado"
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="pendiente">Pendiente</MenuItem>
              <MenuItem value="pagado">Pagado</MenuItem>
              <MenuItem value="vencido">Vencido</MenuItem>
            </Select>
          </FormControl>

          {cuotasFiltradas.length === 0 ? (
            <Typography>No hay cuotas registradas.</Typography>
          ) : (
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Mostrando {((page - 1) * cuotasPorPagina) + 1} - {Math.min(page * cuotasPorPagina, cuotasFiltradas.length)} de {cuotasFiltradas.length} cuotas
              </Typography>

              {cuotasPaginadas.map((cuota) => (
                <Card
                  key={cuota.id}
                  sx={{
                    mb: 1,
                    backgroundColor: isDarkMode ? theme.palette.grey[900] : theme.palette.grey[100],
                    color: isDarkMode ? theme.palette.grey[100] : theme.palette.text.primary,
                  }}
                >
                  <CardContent>
                    <Typography><strong>Monto:</strong> ${cuota.monto}</Typography>
                    <Typography><strong>Fecha:</strong> {new Date(cuota.fecha_pago).toLocaleDateString()}</Typography>
                    <Typography><strong>Estado:</strong> {cuota.estado}</Typography>
                  </CardContent>
                </Card>
              ))}
              <Box display="flex" justifyContent="center" mt={2}>
                <Pagination
                  count={totalPagesCuotas}
                  page={page}
                  onChange={(e, val) => setPage(val)}
                  color="primary"
                  size="small"
                />
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Pagos */}
          <Typography variant="subtitle1" gutterBottom>Pagos</Typography>
          {pagos.length === 0 ? (
            <Typography>No hay pagos registrados.</Typography>
          ) : (
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Mostrando {((pagePagos - 1) * pagosPorPagina) + 1} - {Math.min(pagePagos * pagosPorPagina, pagos.length)} de {pagos.length} pagos
              </Typography>
              {pagosPaginados.map((pago, idx) => (
                <Card
                  key={pago.id || idx}
                  sx={{
                    mb: 1,
                    backgroundColor: isDarkMode ? theme.palette.grey[900] : theme.palette.grey[100],
                    color: isDarkMode ? theme.palette.grey[100] : theme.palette.text.primary,
                  }}
                >
                  <CardContent>
                    <Typography><strong>Monto:</strong> ${pago.monto}</Typography>
                    <Typography><strong>Fecha:</strong> {new Date(pago.fecha).toLocaleDateString()}</Typography>
                    <Typography><strong>Método:</strong> {pago.metodo || 'No especificado'}</Typography>
                  </CardContent>
                </Card>
              ))}
              <Box display="flex" justifyContent="center" mt={2}>
                <Pagination
                  count={totalPagesPagos}
                  page={pagePagos}
                  onChange={(e, val) => setPagePagos(val)}
                  color="primary"
                  size="small"
                />
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Fotos */}
          <Typography variant="subtitle1" gutterBottom>Fotos del cliente</Typography>
          {credito.detalles.cliente?.fotos?.length === 0 ? (
            <Typography>No hay fotos disponibles.</Typography>
          ) : (
            <Grid container spacing={1}>
              {credito.detalles.cliente.fotos.map((foto, i) => (
                <Grid item key={i}>
                  <Chip
                    icon={<ImageIcon />}
                    label={`Foto ${i + 1}`}
                    onClick={() => setSelectedImage(foto)}
                    clickable
                    variant="outlined"
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Imagen ampliada */}
      {selectedImage && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setSelectedImage(null)}
        >
          <Box width={{ xs: '90%', sm: '60%' }}>
            <Slider {...sliderSettings}>
              {credito.detalles.cliente.fotos.map((url, i) => (
                <Box key={i}>
                  <img
                    src={url}
                    alt={`Foto ${i + 1}`}
                    style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                  />
                </Box>
              ))}
            </Slider>
          </Box>
        </Box>
      )}

      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InfoCredito;