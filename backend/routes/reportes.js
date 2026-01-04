import express from 'express';
import { getAsync, allAsync } from '../config/db.js';

const router = express.Router();

// GET /api/reportes/ventas-hoy - Ventas del día (o rango)
router.get('/ventas-hoy', async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;

        // Obtener zona horaria de config o default
        const TIMEZONE = process.env.TIMEZONE || 'America/Bogota';

        // Helper para convertir UTC a Zona Horaria LOCAL en SQL
        // AT TIME ZONE 'UTC' -> lo interpreta como UTC
        // AT TIME ZONE TIMEZONE -> lo convierte a la hora local
        const localDate = `(created_at AT TIME ZONE 'UTC' AT TIME ZONE '${TIMEZONE}')::date`;

        // Si no hay filtros, usar el día actual LOCAL
        let whereClause = `WHERE ${localDate} = (now() AT TIME ZONE '${TIMEZONE}')::date`;
        let params = [];

        if (fecha_inicio && fecha_fin) {
            whereClause = `WHERE ${localDate} BETWEEN $1 AND $2`;
            params = [fecha_inicio, fecha_fin];
        } else if (fecha_inicio) {
            whereClause = `WHERE ${localDate} >= $1`;
            params = [fecha_inicio];
        } else if (fecha_fin) {
            whereClause = `WHERE ${localDate} <= $1`;
            params = [fecha_fin];
        }

        const query = `
            SELECT
                metodo_pago,
                COUNT(*) as cantidad,
                SUM(monto) as total
            FROM transacciones
            ${whereClause}
            GROUP BY metodo_pago
        `;

        const reportes = await allAsync(query, params);

        const totalQuery = `
            SELECT SUM(monto) as total
            FROM transacciones
            ${whereClause}
        `;

        const totalRow = await getAsync(totalQuery, params);

        res.json({
            detalles: reportes,
            total_general: totalRow?.total || 0,
            fecha: fecha_inicio && fecha_fin ? `${fecha_inicio} a ${fecha_fin}` : new Date().toISOString().split('T')[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/reportes/pedidos-hoy - Pedidos del día (o rango)
router.get('/pedidos-hoy', async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;

        const TIMEZONE = process.env.TIMEZONE || 'America/Bogota';
        const localDate = `(p.created_at AT TIME ZONE 'UTC' AT TIME ZONE '${TIMEZONE}')::date`;

        // Si no hay filtros, usar el día actual en la zona horaria correcta
        let whereClause = `WHERE ${localDate} = (now() AT TIME ZONE '${TIMEZONE}')::date`;
        let params = [];

        if (fecha_inicio && fecha_fin) {
            whereClause = `WHERE ${localDate} BETWEEN $1 AND $2`;
            params = [fecha_inicio, fecha_fin];
        } else if (fecha_inicio) {
            whereClause = `WHERE ${localDate} >= $1`;
            params = [fecha_inicio];
        } else if (fecha_fin) {
            whereClause = `WHERE ${localDate} <= $1`;
            params = [fecha_fin];
        }

        const query = `
            SELECT
                p.id,
                p.mesa_numero,
                u.nombre as mesero,
                p.total,
                p.propina_monto,
                p.estado,
                p.created_at,
                (SELECT COUNT(*) FROM pedido_items pi WHERE pi.pedido_id = p.id) as items_count,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'monto', t.monto,
                            'metodo_pago', t.metodo_pago,
                            'created_at', t.created_at,
                            'cajero_id', t.usuario_facturero_id
                        ) ORDER BY t.created_at ASC
                    ) FILTER (WHERE t.id IS NOT NULL), 
                    '[]'
                ) as pagos,
                SUM(t.monto) as total_pagado_real
            FROM pedidos p
            LEFT JOIN usuarios u ON p.usuario_mesero_id = u.id
            LEFT JOIN transacciones t ON p.id = t.pedido_id
            ${whereClause}
            GROUP BY p.id, p.mesa_numero, u.nombre, p.total, p.propina_monto, p.estado, p.created_at
            ORDER BY p.created_at DESC
        `;

        const pedidos = await allAsync(query, params);
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/reportes/historico - Reporte histórico por día
router.get('/historico', async (req, res) => {
    try {
        const TIMEZONE = process.env.TIMEZONE || 'America/Bogota';

        const ventasPorDiaQuery = `
            SELECT
                (t.created_at AT TIME ZONE 'UTC' AT TIME ZONE '${TIMEZONE}')::date as fecha,
                COUNT(*) as cantidad_transacciones,
                SUM(t.monto) as total_dia
            FROM transacciones t
            WHERE t.completada = TRUE
            GROUP BY (t.created_at AT TIME ZONE 'UTC' AT TIME ZONE '${TIMEZONE}')::date
            ORDER BY fecha DESC
            LIMIT 30
        `;

        const ventasPorDia = await allAsync(ventasPorDiaQuery);

        const totalAcumuladoQuery = `
            SELECT
                COUNT(*) as total_transacciones,
                SUM(monto) as total_acumulado
            FROM transacciones
            WHERE completada = TRUE
        `;

        const totalAcumulado = await getAsync(totalAcumuladoQuery);

        res.json({
            ventas_por_dia: ventasPorDia,
            total_acumulado: totalAcumulado || { total_transacciones: 0, total_acumulado: 0 }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/reportes/tiempos-cocina - Estadísticas de tiempos de preparación
router.get('/tiempos-cocina', async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;

        let whereClause = '';
        let params = [];

        if (fecha_inicio && fecha_fin) {
            whereClause = 'WHERE its.fecha BETWEEN $1 AND $2';
            params = [fecha_inicio, fecha_fin];
        } else if (fecha_inicio) {
            whereClause = 'WHERE its.fecha >= $1';
            params = [fecha_inicio];
        } else if (fecha_fin) {
            whereClause = 'WHERE its.fecha <= $1';
            params = [fecha_fin];
        }

        const query = `
            SELECT 
                mi.id,
                mi.nombre as item_nombre,
                mi.categoria,
                mi.tiempo_estimado,
                SUM(its.total_preparaciones) as total_preparaciones,
                ROUND(AVG(its.tiempo_promedio_minutos)) as tiempo_promedio,
                MIN(its.tiempo_minimo_minutos) as tiempo_minimo,
                MAX(its.tiempo_maximo_minutos) as tiempo_maximo
            FROM item_time_stats its
            JOIN menu_items mi ON its.menu_item_id = mi.id
            ${whereClause}
            GROUP BY mi.id, mi.nombre, mi.categoria, mi.tiempo_estimado
            HAVING SUM(its.total_preparaciones) > 0
            ORDER BY total_preparaciones DESC
        `;

        const stats = await allAsync(query, params);

        const statsConDiferencia = stats.map(stat => ({
            ...stat,
            tiempo_promedio: Number(stat.tiempo_promedio),
            diferencia_minutos: stat.tiempo_estimado ?
                Math.round(Number(stat.tiempo_promedio) - stat.tiempo_estimado) : null
        }));

        res.json(statsConDiferencia);
    } catch (error) {
        console.error('Error en /tiempos-cocina:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/reportes/top-platos - Top platos más pedidos (con filtro de fechas opcional)
router.get('/top-platos', async (req, res) => {
    try {
        const { limit = 10, fecha_inicio, fecha_fin } = req.query;

        // 1. Empezamos desde menu_items para mostrar platos aunque no tengan ventas
        let query = `
            SELECT 
                mi.id,
                mi.nombre,
                mi.categoria,
                mi.precio,
                COUNT(pi.id) as total_pedidos,
                COALESCE(SUM(pi.precio_unitario), 0) as ingresos_totales
            FROM menu_items mi
            LEFT JOIN pedido_items pi ON mi.id = pi.menu_item_id
            LEFT JOIN pedidos p ON pi.pedido_id = p.id
        `;

        const params = [];
        let paramIndex = 1;
        let whereConditions = ["p.estado != 'cancelado' OR p.estado IS NULL"]; // Permitir NULL si no hay pedidos

        // 2. Lógica de Fechas (Aplicada al JOIN o al WHERE global)
        if (fecha_inicio && fecha_fin) {
            // Si hay filtro de fecha, solo contamos los pedidos en ese rango
            // IMPORTANTE: Si filtramos por fecha en el WHERE global, los platos sin ventas desaparecerían.
            // Lo movemos al JOIN o usamos una subquery, pero para simplificar:
            // Solo mostramos platos con ventas en ese rango O todos si no hay filtro.

            whereConditions.push(`p.created_at::date BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
            params.push(fecha_inicio, fecha_fin);
            paramIndex += 2;
        }

        // Combinamos condiciones
        if (whereConditions.length > 0) {
            query += ` WHERE ${whereConditions.join(' AND ')}`;
        }

        query += `
            GROUP BY mi.id, mi.nombre, mi.categoria, mi.precio
            ORDER BY total_pedidos DESC
            LIMIT $${paramIndex}
        `;

        params.push(parseInt(limit));

        const topPlatos = await allAsync(query, params);

        // Aseguramos que ingresos_totales sea número para evitar NaN en frontend
        const platosFormateados = topPlatos.map(p => ({
            ...p,
            ingresos_totales: Number(p.ingresos_totales || 0),
            total_pedidos: Number(p.total_pedidos || 0),
            precio: Number(p.precio || 0)
        }));

        res.json(platosFormateados);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/reportes/propinas-hoy - Reporte de propinas del día
router.get('/propinas-hoy', async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;

        const TIMEZONE = process.env.TIMEZONE || 'America/Bogota';
        const localDate = `(p.created_at AT TIME ZONE 'UTC' AT TIME ZONE '${TIMEZONE}')::date`;

        // Si no hay filtros, usar el día actual
        let whereClause = `WHERE ${localDate} = (now() AT TIME ZONE '${TIMEZONE}')::date 
                           AND p.estado = 'pagado' 
                           AND p.propina_monto > 0`;
        let params = [];

        if (fecha_inicio && fecha_fin) {
            whereClause = `WHERE ${localDate} BETWEEN $1 AND $2 
                           AND p.estado = 'pagado' 
                           AND p.propina_monto > 0`;
            params = [fecha_inicio, fecha_fin];
        } else if (fecha_inicio) {
            whereClause = `WHERE ${localDate} >= $1 
                           AND p.estado = 'pagado' 
                           AND p.propina_monto > 0`;
            params = [fecha_inicio];
        } else if (fecha_fin) {
            whereClause = `WHERE ${localDate} <= $1 
                           AND p.estado = 'pagado' 
                           AND p.propina_monto > 0`;
            params = [fecha_fin];
        }

        // Consulta para totales generales
        const totalesQuery = `
            SELECT 
                COUNT(*) as total_pedidos_con_propina,
                SUM(p.propina_monto) as total_propinas,
                ROUND(AVG(p.propina_monto), 2) as promedio_propina
            FROM pedidos p
            ${whereClause}
        `;

        // Consulta para desglose por mesero
        const desgloseMeserosQuery = `
            SELECT 
                u.nombre as mesero,
                u.id as mesero_id,
                COUNT(p.id) as pedidos,
                SUM(p.propina_monto) as total_propinas,
                ROUND(AVG(p.propina_monto), 2) as promedio_propina
            FROM pedidos p
            LEFT JOIN usuarios u ON p.usuario_mesero_id = u.id
            ${whereClause}
            GROUP BY u.id, u.nombre
            ORDER BY total_propinas DESC
        `;

        const [totales, desgloseRes] = await Promise.all([
            getAsync(totalesQuery, params),
            allAsync(desgloseMeserosQuery, params)
        ]);

        res.json({
            total_propinas: Number(totales?.total_propinas || 0),
            promedio_propina: Number(totales?.promedio_propina || 0),
            total_pedidos_con_propina: Number(totales?.total_pedidos_con_propina || 0),
            desglose_meseros: desgloseRes.map(m => ({
                mesero: m.mesero || 'Sin asignar',
                mesero_id: m.mesero_id,
                pedidos: Number(m.pedidos),
                total_propinas: Number(m.total_propinas),
                promedio_propina: Number(m.promedio_propina)
            }))
        });
    } catch (error) {
        console.error('Error en /propinas-hoy:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/reportes/ventas-por-plato - Ventas por plato del día (o rango)
router.get('/ventas-por-plato', async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;

        const TIMEZONE = process.env.TIMEZONE || 'America/Bogota';
        const localDate = `(p.created_at AT TIME ZONE 'UTC' AT TIME ZONE '${TIMEZONE}')::date`;

        // Si no hay filtros, usar el día actual
        let whereClause = `WHERE ${localDate} = (now() AT TIME ZONE '${TIMEZONE}')::date 
                           AND p.estado != 'cancelado'`;
        let params = [];

        if (fecha_inicio && fecha_fin) {
            whereClause = `WHERE ${localDate} BETWEEN $1 AND $2 
                           AND p.estado != 'cancelado'`;
            params = [fecha_inicio, fecha_fin];
        } else if (fecha_inicio) {
            whereClause = `WHERE ${localDate} >= $1 
                           AND p.estado != 'cancelado'`;
            params = [fecha_inicio];
        } else if (fecha_fin) {
            whereClause = `WHERE ${localDate} <= $1 
                           AND p.estado != 'cancelado'`;
            params = [fecha_fin];
        }

        const query = `
            SELECT 
                mi.id as menu_item_id,
                mi.nombre,
                mi.categoria,
                mi.precio as precio_unitario,
                COUNT(pi.id) as cantidad_vendida,
                SUM(pi.precio_unitario) as ingresos_totales
            FROM menu_items mi
            LEFT JOIN pedido_items pi ON mi.id = pi.menu_item_id
            LEFT JOIN pedidos p ON pi.pedido_id = p.id
            ${whereClause}
            GROUP BY mi.id, mi.nombre, mi.categoria, mi.precio
            HAVING COUNT(pi.id) > 0
            ORDER BY cantidad_vendida DESC
        `;

        const ventas = await allAsync(query, params);

        // Formatear los datos
        const ventasFormateadas = ventas.map(v => ({
            menu_item_id: v.menu_item_id,
            nombre: v.nombre,
            categoria: v.categoria,
            precio_unitario: Number(v.precio_unitario || 0),
            cantidad_vendida: Number(v.cantidad_vendida || 0),
            ingresos_totales: Number(v.ingresos_totales || 0)
        }));

        res.json(ventasFormateadas);
    } catch (error) {
        console.error('Error en /ventas-por-plato:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
