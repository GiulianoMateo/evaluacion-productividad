import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/clientes': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/productos': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/ventas': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
