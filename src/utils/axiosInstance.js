import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Axios instance with base URL from VITE_API_URL environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor to attach Authorization and x-tenant headers
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      const decoded = jwtDecode(token);
      if (decoded && decoded.company) {
        config.headers['x-tenant'] = decoded.company;
      }
    }
  } catch (e) {
    console.warn('Failed to decode token for x-tenant header', e);
  }
  return config;
}, (error) => Promise.reject(error));

export default api;
