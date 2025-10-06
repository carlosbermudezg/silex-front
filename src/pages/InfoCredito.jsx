import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
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
  Pagination,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from '@mui/material';
import axios from 'axios';
import { ArrowBack, Image as ImageIcon, Download, CurrencyExchange } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import toast from 'react-hot-toast';
const API_BASE = `${import.meta.env.VITE_API_URL}`;

const InfoCredito = () => {
  const location = useLocation();
  const { credito, configDefault } = location.state || {};
  const [config, setConfig] = useState({})
  const [montoMinimo, setMontoMinimo] = useState(0)
  const [montoMaximo, setMontoMaximo] = useState(0)
  const [plazo, setPlazo] = useState(0)
  const [plazoMaximo, setPlazoMaximo] = useState(0)
  const [plazoMinimo, setPlazoMinimo] = useState(0)
  const [frecuencia, setFrecuencia] = useState('')
  const porcentajeRenovacion = Number(configDefault.porcentaje_minimo_novacion)
  const deudaInicial = Number(credito.detalles.monto) + Number(credito.detalles.monto_interes_generado)
  const deudaMinima = deudaInicial * porcentajeRenovacion / 100

  console.log(credito)

  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [page, setPage] = useState(1);
  const [pagePagos, setPagePagos] = useState(1);
  const [valorRenovacion, setValorRenovacion] = useState(0)
  const [openModal, setOpenModal] = useState(false);
  const [openModalPago, setOpenModalPago] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [valorPagar, setValorPagar] = useState('');
  const [metodoPago, setMetodoPago] = useState('')
  const [puntoSeleccionado, setPuntoSeleccionado] = useState(null);
  const [render, setRender] = useState(false);
  const [ubicacionActual, setUbicacionActual] = useState(null);
  const cuotasPorPagina = 5;
  const pagosPorPagina = 5;
  const token = localStorage.getItem('token');
  const user = jwtDecode(token);
  const renovarCredito = user.permisos.includes('mknovcr')

  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

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

  const renewCredito = async()=>{
    
    if(deudaMinima < (Number(credito.detalles.saldo_capital) + Number(credito.detalles.saldo_interes))){
      return toast.error(`El valor adeudado supera el valor permitido de deuda para renovar: $ ${deudaMinima.toFixed(2)}.`, {position:'bottom-center'})
    }
    
    if(valorRenovacion < montoMinimo){
      return toast.error(`El valor de renovación no puede ser menor de $ ${montoMinimo.toFixed(2)}.`, {position:'bottom-center'})
    }

    if(valorRenovacion > montoMaximo){
      return toast.error(`El valor de renovación no superar $ ${montoMaximo.toFixed(2)}.`, {position:'bottom-center'})
    }



  }

  const handleOpenModal = (punto) => {
    setPuntoSeleccionado(punto);
    setOpenModalPago(true);
  };

  const handleCloseModal = () => {
    setOpenModalPago(false);
    setValorPagar('');
    setPuntoSeleccionado(null);
  };

  const handlePagar = async() => {
    
    const pago = {
      creditoId : puntoSeleccionado.id,
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
    })
    .catch((error) => {
      toast.error(error.response.data.error, {position:'bottom-center'})
      console.log(error)
    })

    // Cerrar el modal después de registrar el pago
    handleCloseModal();
  };

  // Obtener el comprobante de pago en pdf
  const downloadComprobante = async (id) => {
    try {
    const response = await axios.get(`${API_BASE}caja/comprobante/${id}`, {
        responseType: 'blob', 
        headers: {
        Authorization: `Bearer ${token}`,
        },
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `comprobante_pago_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
    } catch (error) {
    console.error('Error al descargar el comprobante:', error);
    }
  };

  //Obtener la configuracion de ruta por usuario
  const getRutaConfig = async()=>{
    await axios.get(`${API_BASE}config/ruta/${credito.detalles.cliente.rutaId}`, {
      headers: {
      Authorization: `Bearer ${token}`,
      },
    }).then((response)=>{
      console.log(response.data)
      const monto_minimo = Number(response.data.monto_minimo) + (Number(credito.detalles.saldo_capital) + Number(credito.detalles.saldo_interes))
      const monto_maximo = Number(response.data.monto_maximo)
      setPlazoMaximo(response.data.plazo_maximo)
      setPlazoMinimo(response.data.plazo_minimo)
      setMontoMinimo(monto_minimo)
      setMontoMaximo(monto_maximo)
      setConfig(response.data)
    }).catch( error => toast.error('Error al obtener la configuración', {position:'bottom-center'}))
  }

  useEffect(()=>{
    const get = async()=>{
      await getRutaConfig()
    }
    get()
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
  const pagos = credito.detalles.pagos || [];

  const cuotasFiltradas = filtroEstado === 'todos'
    ? cuotas
    : cuotas.filter((cuota) => cuota.estado === filtroEstado);

  const totalPagesCuotas = Math.ceil(cuotasFiltradas.length / cuotasPorPagina);
  const cuotasOrdenadas = cuotasFiltradas.sort((a, b) => new Date(a.fecha_pago) - new Date(b.fecha_pago));
  const cuotasPaginadas = cuotasOrdenadas.slice((page - 1) * cuotasPorPagina, page * cuotasPorPagina);
  const totalPagesPagos = Math.ceil(pagos.length / pagosPorPagina);
  const pagosOrdenados = pagos.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const pagosPaginados = pagosOrdenados.slice((pagePagos - 1) * pagosPorPagina, pagePagos * pagosPorPagina);

  return (
    <div style={{ padding: 15, paddingBottom: 80 }}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 999,
          gap: 3,
          backgroundColor: theme.palette.background.default,
          borderBottom: `1px solid ${ theme.palette.border }`,
          height: '60px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack />
        </IconButton>
        <Typography variant='h6'>Información del crédito</Typography>
      </Box>

      <Card 
        sx={{
          backgroundColor: theme.palette.background.primary
        }}>
        <CardContent>
          <Typography variant='body2'><strong>Cliente:</strong> {credito.clienteNombre} {credito.clienteApellido}</Typography>
          <Typography variant='body2'><strong>Teléfono:</strong> {credito.detalles.cliente?.telefono}</Typography>
          <Typography variant='body2'><strong>Dirección:</strong> {credito.detalles.cliente?.direccion}</Typography>
          <Typography variant='body2'><strong>Identificación:</strong> {credito.detalles.cliente?.identificacion}</Typography>
          <Typography variant='body2'><strong>Producto:</strong> {credito.detalles.producto?.nombre}</Typography>
          <Typography variant='body2'><strong>Monto Prestado:</strong> $ {credito.monto}</Typography>
          <Typography variant='body2'><strong>Interés:</strong> {credito.detalles.interes}%</Typography>
          <Typography variant='body2'><strong>Monto a pagar:</strong> $ {(Number(credito.detalles.monto) + Number(credito.detalles.monto_interes_generado)).toFixed(2)}</Typography>
          <Typography variant='body2'><strong>Saldo:</strong> $ {credito.detalles.saldo}</Typography>
          <Typography variant='body2'><strong>Plazo:</strong> {credito.detalles.plazo} días</Typography>
          <Typography variant='body2'><strong>Frecuencia:</strong> {credito.detalles.frecuencia_pago}</Typography>
          <Typography variant='body2'><strong>Estado:</strong> {credito.estado}</Typography>
          <Typography variant='body2'><strong>Fecha creación:</strong> {new Date(credito.createdAt).toLocaleDateString()}</Typography>
          <Typography variant='body2'><strong>Vencimiento:</strong> {new Date(credito.detalles.fechaVencimiento).toLocaleDateString()}</Typography>
          <Divider sx={{ my: 2 }} />
          {
            renovarCredito &&
            <>
              <Button
                  sx={{width:'100%', marginTop:1}}
                  variant='contained'
                  color='primary'
                  startIcon={<CurrencyExchange></CurrencyExchange>}
                  onClick={()=> setOpenModal(true)}
              >Renovar Crédito</Button>
              <Divider sx={{ my: 2 }} />
            </>
          }
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
              <MenuItem value="impago">Impago</MenuItem>
              <MenuItem value="pagado">Pagado</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant='contained'
            sx={{
              backgroundColor: theme.palette.green,
              color: '#fff',
              marginLeft: '10px'
            }}
            onClick={()=> handleOpenModal(credito)}
          >Pagar</Button>

          {cuotasFiltradas.length === 0 ? (
            <Typography>No hay cuotas registradas.</Typography>
          ) : (
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Mostrando {((page - 1) * cuotasPorPagina) + 1} - {Math.min(page * cuotasPorPagina, cuotasFiltradas.length)} de {cuotasFiltradas.length} cuotas
              </Typography>

              {cuotasPaginadas.map((cuota) => {
                const color = cuota.estado === 'pagado' ? theme.palette.green : theme.palette.orange
                return(
                <Card
                  key={cuota.id}
                  sx={{
                    mb: 1,
                    backgroundColor: theme.palette.background.secondary,
                    color: theme.palette.text.primary,
                  }}
                >
                  <CardContent>
                    <Typography><strong>Monto:</strong> $ {cuota.monto.toFixed(2)}</Typography>
                    <Typography><strong>Fecha:</strong> {new Date(cuota.fecha_pago).toLocaleDateString()}</Typography>
                    <strong>Abonado: </strong><Chip sx={{ backgroundColor: color }} size='small' label={`$ ${cuota.monto_pagado.toFixed(2)}`}></Chip>
                    <Typography><strong>Estado:</strong> {cuota.estado}</Typography>
                  </CardContent>
                </Card>
              )})}
              <Box display="flex" justifyContent="center" mt={2}>
                <Pagination
                  sx={{width:'100%', borderRadius:3, display:'flex', justifyContent:'center', border: `1px solid ${ theme.palette.border }`, p:1, mt:1}}
                  count={totalPagesCuotas}
                  page={page}
                  onChange={(e, val) => setPage(val)}
                  color= { theme.palette.background.default }        
                  shape='rounded'
                  variant='outlined'
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
                    backgroundColor: theme.palette.background.secondary,
                    color: isDarkMode ? theme.palette.grey[100] : theme.palette.text.primary,
                  }}
                >
                  <CardContent>
                    <Typography><strong>Monto: </strong>${pago.monto}</Typography>
                    <Typography><strong>Fecha: </strong>
                        {new Date(pago.createdAt).toLocaleString('es-EC', {
                          timeZone: 'America/Guayaquil',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
                    </Typography>
                    <Typography><strong>Método: </strong> {pago.metodoPago || 'No especificado'}</Typography>
                    <Button
                        sx={{width:'100%', marginTop:1}}
                        variant='contained'
                        color='info'
                        startIcon={<Download></Download>}
                        onClick={()=> downloadComprobante(pago.id)}
                    >Descargar</Button>
                  </CardContent>
                </Card>
              ))}
              <Box display="flex" justifyContent="center" mt={2}>
                <Pagination
                  sx={{width:'100%', borderRadius:3, display:'flex', justifyContent:'center', border: `1px solid ${ theme.palette.border }`, p:1, mt:1}}
                  count={totalPagesPagos}
                  page={pagePagos}
                  onChange={(e, val) => setPagePagos(val)}
                  color= { theme.palette.background.default }        
                  shape='rounded'
                  variant='outlined'
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
                <Grid key={i}>
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

      {/* Modal para renovar el credito */}
      <Dialog open={openModal} onClose={()=> setOpenModal(false)}>
        <DialogTitle>Renovación de crédito</DialogTitle>
        <DialogContent>
          <Typography variant='caption'>¿Está seguro que desea renovar este crédito?</Typography>
          <section style={{display:'flex', flexDirection:'column', gap:10}}>
            <TextField
              autoFocus
              margin="dense"
              label="Valor de renovación"
              size='small'
              type="number"
              fullWidth
              value={valorRenovacion}
              onChange={(e) => setValorRenovacion(e.target.value)}
              variant="outlined"
            />
            <TextField
              fullWidth
              size='small'
              label="Plazo en días"
              name="plazo"
              value={plazo}
              onChange={(e)=> setPlazo(e.target.value)}
              type="number"
              inputProps={{ min: 1 }}
            />
            <TextField
              fullWidth
              size='small'
              select
              label="Frecuencia de pago"
              name="frecuencia_pago"
              value={frecuencia}
              onChange={(e)=> setFrecuencia(e.target.value)}
              disabled={!config}
              // error={Boolean(errors.frecuencia_pago)}
              // helperText={errors.frecuencia_pago}
            >
              {(config && config.frecuencia_pago ?
                JSON.parse('["' + config.frecuencia_pago.replace(/[{}]/g, '').replace(/,/g, '","') + '"]') : []
              ).map((frecuencia) => (
                <MenuItem key={frecuencia} value={frecuencia}>
                  {frecuencia}
                </MenuItem>
              ))}
            </TextField>
          </section>

          <Typography variant='caption'>Deuda Actual: $ {(Number(credito.detalles.saldo_capital) + Number(credito.detalles.saldo_interes)).toFixed(2)}</Typography><br />
          <Typography variant='caption'>Deuda permitida: $ {deudaMinima.toFixed(2)}</Typography><br />
          <Typography variant='caption'>Valor a entregar: $ {valorRenovacion <= 0 ? 0 : ((valorRenovacion) - (Number(credito.detalles.saldo_capital) + Number(credito.detalles.saldo_interes)).toFixed(2))}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=> setOpenModal(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={()=> renewCredito()} color="success">
            Renovar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para registrar el pago */}
      <Dialog open={openModalPago} onClose={handleCloseModal}>
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

export default InfoCredito;