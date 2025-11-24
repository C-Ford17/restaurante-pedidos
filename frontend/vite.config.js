import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    strictPort: false,
    host: '0.0.0.0', // Permitir acceso desde la red
    // Proxy ya no es estrictamente necesario si api.js maneja la URL completa,
    // pero lo dejamos por si acaso se usa /api relativo en algún lugar.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  },
  publicDir: 'public'  // Asegurar que public/ se copia
})
