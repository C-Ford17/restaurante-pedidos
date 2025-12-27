import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { allAsync, runAsync, getAsync } from '../config/db.js';

const router = express.Router();

// ========================
// INVENTARIO (Raw Materials)
// ========================

// GET /api/inventory - Listar todo el inventario
router.get('/', async (req, res) => {
    try {
        const items = await allAsync('SELECT * FROM inventory_items ORDER BY name');
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/inventory - Crear item
router.post('/', async (req, res) => {
    try {
        const { name, unit, current_stock, min_stock, cost_per_unit } = req.body;
        const id = uuidv4();

        await runAsync(
            `INSERT INTO inventory_items (id, name, unit, current_stock, min_stock, cost_per_unit) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, name, unit || 'kg', current_stock || 0, min_stock || 0, cost_per_unit || 0]
        );

        res.json({ id, message: 'Item creado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/inventory/:id - Actualizar item
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, unit, current_stock, min_stock, cost_per_unit } = req.body;

        await runAsync(
            `UPDATE inventory_items 
             SET name = $1, unit = $2, current_stock = $3, min_stock = $4, cost_per_unit = $5, updated_at = CURRENT_TIMESTAMP
             WHERE id = $6`,
            [name, unit, current_stock, min_stock, cost_per_unit, id]
        );

        res.json({ message: 'Item actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/inventory/:id/stock - Ajuste rápido de stock (Restock o Pérdida)
router.put('/:id/stock', async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, operation } = req.body; // operation: 'add', 'subtract', 'set'

        if (!quantity || !operation) return res.status(400).json({ error: 'Faltan parámetros' });

        let sql = '';
        let params = [];

        if (operation === 'add') {
            sql = 'UPDATE inventory_items SET current_stock = current_stock + $1 WHERE id = $2';
            params = [quantity, id];
        } else if (operation === 'subtract') {
            sql = 'UPDATE inventory_items SET current_stock = current_stock - $1 WHERE id = $2';
            params = [quantity, id];
        } else if (operation === 'set') {
            sql = 'UPDATE inventory_items SET current_stock = $1 WHERE id = $2';
            params = [quantity, id];
        }

        await runAsync(sql, params);
        res.json({ message: 'Stock actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/inventory/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await runAsync('DELETE FROM inventory_items WHERE id = $1', [id]);
        res.json({ message: 'Item eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message }); // FK constraint alert handled by frontend usually
    }
});


// ========================
// RECETAS (Dish Ingredients)
// ========================

// GET /api/inventory/recipe/:menuItemId - Obtener ingredientes de un plato
router.get('/recipe/:menuItemId', async (req, res) => {
    try {
        const { menuItemId } = req.params;
        const ingredients = await allAsync(`
            SELECT di.*, ii.name as inventory_name, ii.unit 
            FROM dish_ingredients di
            JOIN inventory_items ii ON di.inventory_item_id = ii.id
            WHERE di.menu_item_id = $1
        `, [menuItemId]);
        res.json(ingredients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/inventory/recipe - Guardar receta (reemplaza toda la lista anterior para ese plato)
router.post('/recipe', async (req, res) => {
    try {
        const { menuItemId, ingredients } = req.body; // ingredients = [{ inventory_item_id, quantity_required }]

        // 1. Limpiar ingredientes previos
        await runAsync('DELETE FROM dish_ingredients WHERE menu_item_id = $1', [menuItemId]);

        // 2. Insertar nuevos
        if (ingredients && ingredients.length > 0) {
            for (const ing of ingredients) {
                await runAsync(
                    `INSERT INTO dish_ingredients (menu_item_id, inventory_item_id, quantity_required) VALUES ($1, $2, $3)`,
                    [menuItemId, ing.inventory_item_id, ing.quantity_required]
                );
            }
        }

        res.json({ message: 'Receta guardada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
