import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const vercelConfigPath = path.resolve(__dirname, '../vercel.json'); // Ajustar ruta si es necesario

// Leer URL del backend y LIMPIARLA (igual que en vite.config.js)
let backendUrl = process.env.VITE_API_URL || 'https://TU-BACKEND-URL-AQUI';

// Quitar /api si lo tiene, queremos la base
if (backendUrl.endsWith('/api')) {
    backendUrl = backendUrl.substring(0, backendUrl.length - 4);
}
if (backendUrl.endsWith('/')) {
    backendUrl = backendUrl.substring(0, backendUrl.length - 1);
}

// Configuración dinámica
const vercelConfig = {
    "rewrites": [
        {
            "source": "/.well-known/(.*)",
            "destination": `${backendUrl}/api/well-known/$1`
        },
        {
            "source": "/api/(.*)",
            "destination": `${backendUrl}/api/$1`
        },
        {
            "source": "/(.*)",
            "destination": "/"
        }
    ]
};

console.log('🔄 Generando vercel.json con Backend URL:', backendUrl);

// Escribir archivo
fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));

console.log('✅ frontend/vercel.json actualizado correctamente.');
