import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // El frontend corre en :5173; el backend Express en :3000.
      // El proxy evita problemas de CORS en desarrollo.
      '/api': 'http://localhost:3000',
    },
  },
})
