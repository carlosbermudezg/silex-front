import { jwtDecode } from 'jwt-decode';

export const validarToken = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return false;
  }

  try {
    const decoded = jwtDecode(token);
    const exp = decoded.exp * 1000; // pasa de segundos a milisegundos
    const now = Date.now();

    if (exp < now) {
      localStorage.removeItem('token');
      return false;
    }

    return true; // Token válido
  } catch (error) {
    localStorage.removeItem('token');
    console.log(error)
    return false;
  }
};