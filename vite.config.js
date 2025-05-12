import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // o "0.0.0.0"
    allowedHosts: ['.ngrok-free.app'], 
    port: 2222
  }
})
