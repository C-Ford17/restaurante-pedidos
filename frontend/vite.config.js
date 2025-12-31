import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createHtmlPlugin } from 'vite-plugin-html'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  // Limpiar URL para que no tenga doble /api
  let apiUrl = env.VITE_API_URL || '';

  // ✅ FORCE RELATIVE PATH IN DEVELOPMENT to allow proxying from ANY device (LAN)
  // This ensures icons in index.html load as /api/icons/... relative to the device's URL
  if (mode === 'development') {
    apiUrl = '';
  } else {
    // Production logic
    if (apiUrl.endsWith('/api')) {
      apiUrl = apiUrl.substring(0, apiUrl.length - 4);
    }
    if (apiUrl.endsWith('/')) {
      apiUrl = apiUrl.substring(0, apiUrl.length - 1);
    }
  }

  // ✅ Read package version
  const pkg = require('./package.json')

  // ✅ Plugin para generar version.json
  const generateVersionFile = () => {
    return {
      name: 'generate-version-file',
      writeBundle() {
        // En build normal
        const fs = require('fs');
        const filePath = path.resolve(__dirname, 'dist/version.json');
        fs.writeFileSync(filePath, JSON.stringify({ version: pkg.version }));
      },
      configureServer(server) {
        // En modo dev (serve)
        server.middlewares.use((req, res, next) => {
          if (req.url === '/version.json') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ version: pkg.version }));
          } else {
            next();
          }
        });
      }
    }
  }

  return {
    define: {
      '__APP_VERSION__': JSON.stringify(pkg.version)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    plugins: [
      vue(),
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            title: env.VITE_APP_TITLE,
            description: env.VITE_APP_DESCRIPTION,
            themeColor: env.VITE_THEME_COLOR,
            apiUrl: apiUrl, // ✅ URL limpia (sin /api al final)
          },
        },
      }),
      VitePWA({
        registerType: 'autoUpdate',
        strategies: 'injectManifest', // ✅ Usar modo inyección
        srcDir: 'src',                // ✅ Carpeta fuente
        filename: 'sw.js',            // ✅ Nombre del archivo
        manifest: {
          name: env.VITE_APP_TITLE,
          short_name: env.VITE_APP_SHORT_NAME,
          description: env.VITE_APP_DESCRIPTION,
          start_url: "/",
          scope: "/",
          display: "standalone",
          orientation: "portrait-primary",
          background_color: env.VITE_BACKGROUND_COLOR,
          theme_color: env.VITE_THEME_COLOR,
          icons: []
        }
      }),
      generateVersionFile() // ✅ Registrar plugin custom
    ],
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
        },
        '/socket.io': {
          target: 'http://localhost:3000',
          ws: true,
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser'
    },
    publicDir: 'public'  // Asegurar que public/ se copia
  }
})
