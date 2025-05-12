import { jwtDecode } from 'jwt-decode';

export const validarToken = (navigate) => {
  const token = localStorage.getItem('token');

  if (!token) {
    navigate('/');
    return false;
  }

  try {
    const decoded = jwtDecode(token);
    const exp = decoded.exp * 1000; // pasa de segundos a milisegundos
    const now = Date.now();

    if (exp < now) {
      localStorage.removeItem('token');
      navigate('/');
      return false;
    }

    return true; // Token válido
  } catch (error) {
    localStorage.removeItem('token');
    navigate('/');
    return false;
  }
};