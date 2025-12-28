<template>
  <div class="admin-inventory">
    <div class="header">
      <h2>Inventario y Materia Prima</h2>
      <button @click="$emit('volver')" class="btn-volver">← Volver</button>
    </div>

    <!-- Acciones -->
    <div class="actions-bar">
      <button @click="openCreateModal" class="btn-create">
        + Nuevo Insumo
      </button>
    </div>

    <!-- Tabla de Inventario -->
    <div class="inventory-table-container">
      <table class="inventory-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Stock Actual</th>
            <th>Und</th>
            <th>Stock Mínimo</th>
            <th>Costo / Und</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td data-label="Nombre">{{ item.name }}</td>
            <td data-label="Stock Actual" :class="getStockClass(item)">
              {{ formatNumber(item.current_stock) }}
            </td>
            <td data-label="Und">{{ item.unit }}</td>
            <td data-label="Stock Mínimo">{{ formatNumber(item.min_stock) }}</td>
            <td data-label="Costo / Und">${{ formatNumber(item.cost_per_unit) }}</td>
            <td data-label="Estado">
              <span class="status-badge" :class="getStatusClass(item)">
                {{ getStatusLabel(item) }}
              </span>
            </td>
            <td data-label="Acciones" class="actions-cell">
              <button @click="openQuickStock(item, 'add')" class="btn-icon add" title="Reponer stock">+</button>
              <button @click="openEditModal(item)" class="btn-icon edit" title="Editar">✎</button>
              <button @click="deleteItem(item)" class="btn-icon delete" title="Eliminar">🗑</button>
            </td>
          </tr>
          <tr v-if="items.length === 0">
            <td colspan="7" class="empty-state">
              No hay insumos registrados.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Crear/Editar -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ isEditing ? 'Editar Insumo' : 'Nuevo Insumo' }}</h3>
        <form @submit.prevent="saveItem" class="inventory-form">
          <div class="form-group">
            <label>Nombre</label>
            <input v-model="form.name" required placeholder="Ej. Carne de Res, Papas..." />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Unidad</label>
              <select v-model="form.unit">
                <option value="kg">Kilogramos (kg)</option>
                <option value="g">Gramos (g)</option>
                <option value="l">Litros (l)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="unid">Unidades</option>
                <option value="oz">Onzas</option>
                <option value="lb">Libras</option>
              </select>
            </div>
            <div class="form-group">
              <label>Costo Unitario</label>
              <input type="number" step="0.01" v-model="form.cost_per_unit" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Stock Actual</label>
              <input type="number" step="0.0001" v-model="form.current_stock" />
            </div>
            <div class="form-group">
              <label>Stock Mínimo</label>
              <input type="number" step="0.0001" v-model="form.min_stock" />
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-cancel">Cancelar</button>
            <button type="submit" class="btn-save">Guardar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Stock Rápido -->
    <div v-if="showStockModal" class="modal-overlay">
      <div class="modal sm">
        <h3>Ajustar Stock: {{ selectedItem?.name }}</h3>
        <div class="stock-actions">
           <p>Stock Actual: <strong>{{ formatNumber(selectedItem?.current_stock) }} {{ selectedItem?.unit }}</strong></p>
           
           <div class="form-group">
             <label>Cantidad a agregar/quitar</label>
             <input type="number" step="0.0001" v-model="stockForm.quantity" autofocus />
           </div>

           <div class="modal-actions">
             <button @click="closeStockModal" class="btn-cancel">Cancelar</button>
             <button @click="applyStock('add')" class="btn-save add">Agregar (+)</button>
             <button @click="applyStock('subtract')" class="btn-save subtract">Quitar (-)</button>
           </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';

const items = ref([]);
const showModal = ref(false);
const showStockModal = ref(false);
const isEditing = ref(false);
const selectedItem = ref(null);

const form = ref({
  id: null,
  name: '',
  unit: 'kg',
  current_stock: 0,
  min_stock: 0,
  cost_per_unit: 0
});

const stockForm = ref({
  quantity: 0
});

onMounted(() => {
  loadInventory();
});

async function loadInventory() {
  try {
    const res = await api.getInventory();
    items.value = res.data;
  } catch (error) {
    console.error('Error cargando inventario:', error);
    alert('Error cargando inventario');
  }
}

function formatNumber(num) {
  return Number(num).toLocaleString('es-ES', { maximumFractionDigits: 3 });
}

function getStockClass(item) {
  if (Number(item.current_stock) <= 0) return 'text-danger';
  if (Number(item.current_stock) <= Number(item.min_stock)) return 'text-warning';
  return 'text-success';
}

function getStatusLabel(item) {
  const stock = Number(item.current_stock);
  const min = Number(item.min_stock);
  if (stock <= 0) return 'AGOTADO';
  if (stock <= min) return 'BAJO';
  return 'OK';
}

function getStatusClass(item) {
  const label = getStatusLabel(item);
  if (label === 'AGOTADO') return 'badge-danger';
  if (label === 'BAJO') return 'badge-warning';
  return 'badge-success';
}

// Modal Logic
function openCreateModal() {
  isEditing.value = false;
  form.value = { name: '', unit: 'kg', current_stock: 0, min_stock: 0, cost_per_unit: 0 };
  showModal.value = true;
}

function openEditModal(item) {
  isEditing.value = true;
  form.value = { ...item };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

async function saveItem() {
  try {
    if (isEditing.value) {
      await api.updateInventoryItem(form.value.id, form.value);
    } else {
      await api.createInventoryItem(form.value);
    }
    closeModal();
    loadInventory();
  } catch (error) {
    console.error(error);
    alert('Error guardando item');
  }
}

async function deleteItem(item) {
  if (!confirm(`¿Seguro que deseas eliminar ${item.name}?`)) return;
  try {
    await api.deleteInventoryItem(item.id);
    loadInventory();
  } catch (error) {
    console.error(error);
    alert('No se puede eliminar (probablemente esté en uso en una receta)');
  }
}

// Quick Stock Logic
function openQuickStock(item) {
  selectedItem.value = item;
  stockForm.value = { quantity: 1 }; // Default value can be 1
  showStockModal.value = true;
}

function closeStockModal() {
  showStockModal.value = false;
  selectedItem.value = null;
}

async function applyStock(operation) {
  const qty = Number(stockForm.value.quantity);
  if (!qty || qty <= 0) return alert('Cantidad inválida');

  try {
    await api.updateStock(selectedItem.value.id, qty, operation);
    closeStockModal();
    loadInventory();
  } catch (error) {
    console.error(error);
    alert('Error actualizando stock');
  }
}
</script>

<style scoped>
.admin-inventory {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.header h2 {
  margin: 0;
  color: #1f2937;
  font-size: 1.5rem;
}

.btn-volver {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.actions-bar {
  margin-bottom: 1rem;
  display: flex;
  justify-content: flex-end;
}

.btn-create {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.inventory-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
}

.inventory-table th,
.inventory-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}

.inventory-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #6b7280;
  font-size: 0.875rem;
  text-transform: uppercase;
}

.text-danger { color: #dc2626; font-weight: bold; }
.text-warning { color: #d97706; font-weight: bold; }
.text-success { color: #059669; }

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-danger { background: #fee2e2; color: #991b1b; }
.badge-warning { background: #fef3c7; color: #92400e; }
.badge-success { background: #d1fae5; color: #065f46; }

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1rem;
}

.btn-icon.add { background: #e0e7ff; color: #4338ca; }
.btn-icon.edit { background: #f3f4f6; color: #4b5563; }
.btn-icon.delete { background: #fee2e2; color: #dc2626; }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal.sm { max-width: 400px; }

.inventory-form .form-group {
  margin-bottom: 1rem;
}

.inventory-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.inventory-form input,
.inventory-form select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-cancel {
  background: transparent;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
}

.btn-save {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-save.subtract { background: #ef4444; }
.btn-save.add { background: #10b981; }

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .header h2 {
    text-align: center;
    font-size: 1.25rem;
  }

  .btn-volver {
    width: 100%;
    text-align: center;
    padding: 0.75rem;
  }

  .inventory-table-container {
    background: transparent;
    box-shadow: none;
    overflow: visible;
  }

  .inventory-table thead {
    display: none;
  }

  .inventory-table, .inventory-table tbody, .inventory-table tr, .inventory-table td {
    display: block;
    width: 100%;
  }

  .inventory-table tr {
    margin-bottom: 1rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    overflow: hidden;
  }

  .inventory-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f3f4f6;
    text-align: right;
  }

  .inventory-table td:last-child {
    border-bottom: none;
    justify-content: center;
    padding: 1rem;
    background: #f9fafb;
  }

  .inventory-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    font-size: 0.75rem;
    text-align: left;
  }

  .actions-cell {
    justify-content: center;
    gap: 1rem;
  }

  .btn-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }
}

</style>
