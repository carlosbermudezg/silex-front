import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useTheme } from '@mui/material/styles';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress,
  Divider,
  Box,
  Chip,
  Pagination,
  Button
} from '@mui/material';
import { Download } from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = `${import.meta.env.VITE_API_URL}`;

const Pagos = () => {
    const [abonos, setAbonos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const theme =useTheme();
    const token = localStorage.getItem('token');
    const user = jwtDecode(token);
    const turnoId = localStorage.getItem('turno');

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

    // Obtener los pagos
    const getValidAbonosByTurno = async () => {
        try {
            const res = await axios.get(`${API_BASE}caja/abonosValid-turno/${turnoId}?page=${page}&limit=10`, {
            headers: { Authorization: `Bearer ${token}` }
            });
            setLoading(false)
            setTotalPages(res.data.totalPages)
            setAbonos(res.data.data); // Los movimientos de la página actual
        } catch (err) {
            setLoading(false)
            // console.error(err);
        }
    };

    useEffect(()=>{
    const get = async()=>{
        await getValidAbonosByTurno()
    }
    get()
    },[turnoId, page])

    return (
    <div style={{ padding: 20, paddingBottom: 70 }}>
        <Typography variant="h5" gutterBottom>
        Comprobantes
        </Typography>

        {/* Paginación */}
        <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                size="small"
            />
        </Box>

        {/* Lista de gastos */}
        {loading ? (
        <CircularProgress color='info'/>
        ) : abonos.length === 0 ? (
        <Typography variant="body1">No hay comprobantes registrados hoy.</Typography>
        ) : (
        <>
            <List>
            {abonos.map((abono) => (
                <Paper key={abono.id} sx={{ mb: 1, backgroundColor: theme.palette.primary.main }}>
                    <Chip
                        label={`$ ${abono.monto}`}
                        color='success'
                        size="small"
                        sx={{ textTransform: 'capitalize', position:'absolute', right:5, marginTop:1}}
                    />
                <ListItem>
                    <ListItemText
                    sx={{width:'100%', position:'relative'}}
                    primary={abono.nombre}
                    secondary={
                        <>
                        <label variant='caption'>
                            {' '}
                            {new Date(abono.createdAt).toLocaleString('es-EC', {
                            timeZone: 'America/Guayaquil',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                            })}
                        </label><br></br>
                        <label variant='caption'>{abono.metodoPago}</label>
                        <label style={{display:'flex', width:'100%', justifyContent:'center'}}>
                            <Button
                                sx={{width:'100%', marginTop:1}}
                                variant='contained'
                                color='info'
                                startIcon={<Download></Download>}
                                onClick={()=> downloadComprobante(abono.id)}
                            >Descargar</Button>
                        </label>
                        </>
                    }
                    />
                </ListItem>
                </Paper>
            ))}
            </List>
        </>
        )}
    </div>
    );
};

export default Pagos;