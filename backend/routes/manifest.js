import express from 'express';
import { allAsync } from '../config/db.js';

const router = express.Router();

// GET /api/manifest - Manifest.json dinámico basado en configuración
router.get('/', async (req, res) => {
    try {
        const configRows = await allAsync('SELECT clave, valor FROM configuracion');
        const config = {};
        configRows.forEach(row => {
            config[row.clave] = row.valor;
        });

        const manifest = {
            start_url: '/',
            display: 'standalone',
            background_color: '#ffffff',
            theme_color: config.color_primario || '#667eea',
            icons: []
        };

        if (config.nombre) manifest.name = config.nombre;
        if (config.nombre_corto) manifest.short_name = config.nombre_corto;
        if (config.subtitulo) manifest.description = config.subtitulo;

        // Agregar iconos solo si existen en la configuración
        if (config.icon_192_url) {
            manifest.icons.push({
                src: config.icon_192_url,
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable'
            });
        }

        if (config.icon_512_url) {
            manifest.icons.push({
                src: config.icon_512_url,
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
            });
        }

        res.setHeader('Content-Type', 'application/json');
        res.json(manifest);
    } catch (error) {
        console.error('Error generando manifest:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
