import express from 'express';
import { getAsync } from '../config/db.js';

const router = express.Router();

// GET /api/well-known/:filename
// Sirve archivos de verificación (assetlinks.json, apple-app-site-association) dinámicamente desde la BD
router.get('/:filename', async (req, res) => {
    try {
        const { filename } = req.params;

        // Mapeo de nombres de archivo a claves de configuración
        const configKeys = {
            'assetlinks.json': 'well_known_assetlinks',
            'apple-app-site-association': 'well_known_apple',
        };

        const configKey = configKeys[filename];

        if (!configKey) {
            return res.status(404).json({ error: 'Archivo no soportado' });
        }

        const result = await getAsync('SELECT valor FROM configuracion WHERE clave = $1', [configKey]);

        if (!result || !result.valor) {
            // Retornar array vacío por defecto para assetlinks si no está configurado
            if (filename === 'assetlinks.json') return res.json([]);
            return res.status(404).json({ error: 'No configurado' });
        }

        // Determinar Content-Type correcto
        if (filename.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json');
            res.json(JSON.parse(result.valor));
        } else {
            res.setHeader('Content-Type', 'application/json'); // Apple files are usually JSON too
            res.send(result.valor);
        }

    } catch (error) {
        console.error(`Error sirviendo well-known ${req.params.filename}:`, error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
