import express from 'express';
import { getAsync, allAsync, runAsync } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { getFromCache, setCache, clearCache } from '../utils/cache.js'; // ✅ NUEVO

const router = express.Router();

// GET /api/menu - Obtener todos los items del menú
router.get('/', async (req, res) => {
    try {
        // ⚠️ CACHE DESACTIVADO TEMPORALMENTE para soportar inventario en tiempo real
        // const cached = getFromCache('menu_items', 300000);
        // if (cached) return res.json(cached);

        // 1. Obtener items del menú
        let query = `
            SELECT id, nombre, categoria, precio, 
                   COALESCE(tiempo_estimado, tiempo_preparacion_min, 15) as tiempo_estimado, 
                   disponible, descripcion, usa_inventario, stock_actual, stock_minimo,
                   estado_inventario, es_directo, 
                   COALESCE(NULLIF(image_url, ''), imagen_url) as image_url
            FROM menu_items 
        `;

        // Si NO solicitan incluir ocultos, filtramos solo los disponibles
        if (!req.query.include_hidden) {
            query += ' WHERE disponible = true ';
        }

        query += ' ORDER BY categoria, nombre ';

        const items = await allAsync(query);

        // 2. Obtener TODAS las recetas y stock de insumos en una sola consulta
        const allRecipes = await allAsync(`
            SELECT di.menu_item_id, di.quantity_required, di.inventory_item_id, ii.current_stock, ii.name as ing_name
            FROM dish_ingredients di
            JOIN inventory_items ii ON di.inventory_item_id = ii.id
        `);

        // 3. Agrupar recetas por menu_item_id
        const recipeMap = {};
        allRecipes.forEach(r => {
            if (!recipeMap[r.menu_item_id]) recipeMap[r.menu_item_id] = [];
            recipeMap[r.menu_item_id].push(r);
        });

        // 4. Calcular stock lógico para cada item
        const itemsWithCalculatedStock = items.map(item => {
            // Solo procesar si usa inventario (ya sea directo o no, si tiene receta calculamos)
            if (item.usa_inventario && recipeMap[item.id]) {
                const ingredients = recipeMap[item.id];

                // ✅ Attach ingredients info only if needed for frontend validation
                item.ingredients = ingredients.map(ing => ({
                    id: ing.menu_item_id, // This is menu_item_id, wait. query returns: di.menu_item_id, di.quantity_required, ii.current_stock, ii.name 
                    // We need inventory_item_id actually.
                    // The query at line 36 does NOT select inventory_item_id properly labeled?
                    // "SELECT di.menu_item_id, di.quantity_required, ii.current_stock, ii.name as ing_name FROM dish_ingredients di JOIN inventory_items ii ON di.inventory_item_id = ii.id"
                    // Whatever join returns. 'ii.id' is ambiguous if not selected explicitly, but di.inventory_item_id is certain.
                    inventory_item_id: ing.inventory_item_id || ing.id, // We need to check the exact query result shape
                    quantity_required: ing.quantity_required,
                    current_stock: ing.current_stock
                }));

                // Calcular cuántos platos se pueden hacer con el stock actual de cada ingrediente
                // El stock del plato es limitado por el ingrediente más escaso (Reactivo Limitante)
                let maxServings = Infinity;

                for (const ing of ingredients) {
                    if (ing.quantity_required > 0) {
                        // ✅ FIX: Floating point precision (1.2 / 0.4 = 2.9999 -> 3)
                        const servings = Math.floor((ing.current_stock + 0.00001) / ing.quantity_required);
                        if (servings < maxServings) {
                            maxServings = servings;
                        }
                    }
                }

                if (maxServings === Infinity) maxServings = 0; // Fallback freak case

                // ✅ OVERRIDE: Usar el stock calculado
                item.stock_actual = maxServings;

                // ✅ OVERRIDE STATUS: Actualizar estado visual basado en el cálculo real
                // "La opcion de marcar como disponible... dejala pero la cantidad que se maneje con los ingredientes"
                // Interpretación: El estado visual debe reflejar la realidad del stock calculado.
                if (maxServings <= 0) {
                    item.estado_inventario = 'no_disponible';
                } else if (item.stock_minimo && maxServings <= item.stock_minimo) {
                    item.estado_inventario = 'poco_stock';
                } else {
                    item.estado_inventario = 'disponible';
                }
            }
            return item;
        });

        // setCache('menu_items', itemsWithCalculatedStock);
        res.json(itemsWithCalculatedStock);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/menu - Crear nuevo item del menú
router.post('/', async (req, res) => {
    try {
        const { nombre, categoria, precio, tiempo_estimado, disponible, descripcion, usa_inventario, stock_actual, stock_minimo, estado_inventario, es_directo, image_url } = req.body;

        if (!nombre || !categoria || !precio) {
            return res.status(400).json({ error: 'Nombre, categoría y precio son requeridos' });
        }

        const id = uuidv4();
        // Insertamos en AMBAS columnas para evitar inconsistencias
        const query = `
            INSERT INTO menu_items(
                id, nombre, categoria, precio, tiempo_estimado, tiempo_preparacion_min, disponible, descripcion,
                usa_inventario, stock_actual, stock_minimo, estado_inventario, es_directo, image_url
            )
        VALUES($1, $2, $3, $4, $5, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            `;

        await runAsync(query, [
            id,
            nombre,
            categoria,
            precio,
            tiempo_estimado || 15, // Se usa para ambas columnas ($5)
            disponible !== false,
            descripcion || null,
            usa_inventario || false,
            stock_actual || null,
            stock_minimo || null,
            estado_inventario || 'disponible',
            es_directo || false,
            image_url || null
        ]);

        // 🧹 Limpiar caché para refrescar menú
        clearCache('menu_items');

        res.json({ message: '✓ Item agregado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/menu/:id - Actualizar item del menú
// PUT /api/menu/:id - Actualizar item del menú (Parcial o Completo)
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updates = req.body;

        // Mapeo seguro de campos permitidos
        // frontend_field -> db_column
        const fieldMap = {
            'nombre': 'nombre',
            'categoria': 'categoria',
            'precio': 'precio',
            'tiempo_estimado': 'tiempo_estimado', // Prioridad
            'disponible': 'disponible',
            'descripcion': 'descripcion',
            'usa_inventario': 'usa_inventario',
            'stock_actual': 'stock_actual',
            'stock_minimo': 'stock_minimo',
            'estado_inventario': 'estado_inventario',
            'es_directo': 'es_directo',
            'image_url': 'image_url'
        };

        const allowedKeys = Object.keys(fieldMap);
        const keysToUpdate = Object.keys(updates).filter(k => allowedKeys.includes(k));

        if (keysToUpdate.length === 0) {
            return res.status(400).json({ error: 'No se enviaron campos válidos' });
        }

        // Construir query dinámica: SET db_col=$1, db_col2=$2 ...
        let setClause = keysToUpdate.map((k, i) => `${fieldMap[k]} = $${i + 1}`).join(', ');
        const values = keysToUpdate.map(k => updates[k]);

        // Hack: Si viene tiempo_estimado, agregamos tiempo_preparacion_min a la query manualmente
        if (updates.tiempo_estimado) {
            setClause += `, tiempo_preparacion_min = $${values.length + 1}`;
            values.push(updates.tiempo_estimado); // Valor duplicado
        }

        // Agregar ID al final de los valores
        values.push(id);

        const query = `UPDATE menu_items SET ${setClause} WHERE id = $${values.length}`;

        await runAsync(query, values);

        // 🧹 Limpiar caché
        clearCache('menu_items');

        res.json({ message: '✓ Item actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// DELETE /api/menu/:id - Eliminar item del menú
router.delete('/:id', async (req, res) => {
    try {
        await runAsync('DELETE FROM menu_items WHERE id = $1', [req.params.id]);

        // 🧹 Limpiar caché
        clearCache('menu_items');

        res.json({ message: '✓ Item eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/menu/:id/inventario - Actualizar solo inventario
router.put('/:id/inventario', async (req, res) => {
    try {
        const { usa_inventario, stock_actual, stock_minimo, estado_inventario } = req.body;

        await runAsync(`
            UPDATE menu_items 
            SET usa_inventario = $1, stock_actual = $2, stock_minimo = $3, estado_inventario = $4
            WHERE id = $5
            `, [usa_inventario, stock_actual, stock_minimo, estado_inventario, req.params.id]);

        res.json({ message: '✓ Inventario actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/menu/:id/ajustar-stock - Ajustar stock manualmente
router.post('/:id/ajustar-stock', async (req, res) => {
    try {
        const { ajuste } = req.body;

        if (typeof ajuste !== 'number') {
            return res.status(400).json({ error: 'El ajuste debe ser un número' });
        }

        const item = await getAsync('SELECT * FROM menu_items WHERE id = $1', [req.params.id]);

        if (!item) {
            return res.status(404).json({ error: 'Item no encontrado' });
        }

        if (!item.usa_inventario) {
            return res.status(400).json({ error: 'Este item no usa control de inventario' });
        }

        const nuevoStock = (item.stock_actual || 0) + ajuste;

        if (nuevoStock < 0) {
            return res.status(400).json({ error: 'El stock no puede ser negativo' });
        }

        let nuevoEstado = item.estado_inventario;

        if (nuevoStock === 0) {
            nuevoEstado = 'no_disponible';
        } else if (nuevoStock <= item.stock_minimo) {
            nuevoEstado = 'poco_stock';
        } else if (item.estado_inventario === 'no_disponible' && nuevoStock > 0) {
            nuevoEstado = 'disponible';
        } else if (item.estado_inventario === 'poco_stock' && nuevoStock > item.stock_minimo) {
            nuevoEstado = 'disponible';
        }

        await runAsync(`
            UPDATE menu_items 
            SET stock_actual = $1, estado_inventario = $2
            WHERE id = $3
            `, [nuevoStock, nuevoEstado, req.params.id]);

        res.json({
            message: '✓ Stock ajustado',
            stock_actual: nuevoStock,
            estado_inventario: nuevoEstado
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
