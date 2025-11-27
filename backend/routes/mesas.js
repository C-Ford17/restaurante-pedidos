import express from 'express';
import pool, { getAsync, allAsync, runAsync } from '../config/db.js';

const router = express.Router();

// GET /api/mesas - Obtener todas las mesas
router.get('/', async (req, res) => {
    try {
        const mesas = await allAsync('SELECT * FROM mesas ORDER BY numero');
        res.json(mesas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/mesas - Crear mesas
router.post('/', async (req, res) => {
    try {
        const { numero, capacidad } = req.body;

        if (!numero) {
            return res.status(400).json({ error: 'Número de mesa requerido' });
        }

        const query = `INSERT INTO mesas(numero, capacidad) VALUES($1, $2)`;
        await runAsync(query, [numero, capacidad || 4]);

        res.json({
            numero,
            capacidad,
            estado: 'disponible',
            message: '✓ Mesa agregada'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/mesas/:id - Eliminar mesa
router.delete('/:id', async (req, res) => {
    try {
        await runAsync('DELETE FROM mesas WHERE id = $1', [req.params.id]);
        res.json({ message: '✓ Mesa eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/mesas/:numero/pedido-actual - Obtener pedido actual de una mesa (PÚBLICO)
router.get('/:numero/pedido-actual', async (req, res) => {
    try {
        const mesaNumero = req.params.numero;

        // Buscar pedido activo de la mesa (no pagado ni cancelado)
        const pedido = await getAsync(`
            SELECT p.*, u.nombre as mesero
            FROM pedidos p
            LEFT JOIN usuarios u ON p.usuario_mesero_id = u.id
            WHERE p.mesa_numero = $1::integer 
            AND p.estado NOT IN ('pagado', 'cancelado')
            ORDER BY p.created_at DESC
            LIMIT 1
        `, [mesaNumero]);

        if (!pedido) {
            return res.status(404).json({ error: 'No hay pedido activo en esta mesa' });
        }

        // Obtener items con sus estados y tiempos
        const items = await allAsync(`
            SELECT
                pi.id,
                pi.cantidad,
                pi.estado,
                pi.started_at,
                pi.completed_at,
                pi.tiempo_real,
                mi.nombre,
                mi.tiempo_estimado
            FROM pedido_items pi
            JOIN menu_items mi ON pi.menu_item_id = mi.id
            WHERE pi.pedido_id = $1
            ORDER BY pi.id
        `, [pedido.id]);

        // Calcular estadísticas
        const totalItems = items.length;
        const servidos = items.filter(i => i.estado === 'servido').length;
        const listos = items.filter(i => i.estado === 'listo').length;
        const enPreparacion = items.filter(i => i.estado === 'en_preparacion').length;
        const pendientes = items.filter(i => !i.estado || i.estado === 'pendiente').length;

        const progresoDecimal = totalItems > 0 ? (servidos + listos) / totalItems : 0;
        const progresoPorcentaje = Math.round(progresoDecimal * 100);

        const estadisticas = {
            total_items: totalItems,
            servidos,
            listos,
            en_preparacion: enPreparacion,
            pendientes,
            progreso_porcentaje: progresoPorcentaje
        };

        // ✅ NUEVO: Calcular tiempo transcurrido
        const tiempoTranscurrido = pedido.started_at
            ? Math.floor((new Date() - new Date(pedido.started_at)) / 60000)
            : 0;

        console.log('🕐 DEBUG Mesa:', {
            started_at: pedido.started_at,
            tiempoTranscurrido: tiempoTranscurrido,
            ahora: new Date()
        });

        // ✅ CAMBIO: Asignar explícitamente
        const pedidoConTiempo = {
            ...pedido,
            tiempoTranscurrido
        };

        res.json({
            pedido: pedidoConTiempo,
            items,
            estadisticas
        });
    } catch (error) {
        console.error('Error en /mesas/:numero/pedido-actual:', error);
        res.status(500).json({ error: error.message });
    }
});


export default router;
