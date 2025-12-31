<template>
  <div class="customer-status">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ $t('common.loading_status') }}</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>❌ {{ error }}</p>
      <button @click="cargarEstado" class="btn-retry">{{ $t('common.retry') }}</button>
    </div>

    <!-- Order Paid / Completed -->
    <div v-else-if="activeOrders.length > 0 && activeOrders[0].estado === 'pagado'" class="status-content paid-state">
      <div class="paid-success">
        <div class="icon-success">🎉</div>
        <h2>{{ $t('status.pagado') }}</h2>
        <p>{{ $t('order_status.thank_you_visit') || '¡Gracias por su visita!' }}</p>
        <p class="subtext">{{ $t('order_status.receipt_sent') || 'Su comprobante ha sido generado.' }}</p>
        
        <!-- Home button removed - customer must scan QR again to access system -->
      </div>
    </div>

    <!-- Active Orders -->
    <div v-else class="status-content">
      <header class="status-header">
        <h2>{{ $t('order_status.title') }}</h2>
        <div class="table-badge">{{ $t('common.table') }} {{ tableId }}</div>
      </header>

      <!-- Progress Summary -->
      <div class="progress-card">
        <div class="progress-steps">
          <div 
            v-for="(step, idx) in steps" 
            :key="step.key"
            :class="['step', { active: currentStep === idx, completed: currentStep > idx }]"
          >
            <div class="step-icon">
              <component :is="step.icon" :size="20" />
            </div>
            <span class="step-label">{{ step.label }}</span>
          </div>
        </div>
        <div class="status-message">
          <p>{{ statusMessage }}</p>
        </div>
      </div>

      <!-- Order List -->
      <div class="order-list">
        <h3>{{ $t('order_status.your_order') }}</h3>
        
        <div v-for="order in activeOrders" :key="order.id" class="order-group">
          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <div class="item-main">
                <span class="qty">{{ item.cantidad }}x</span>
                <span class="name">{{ item.nombre }}</span>
              </div>
              
              <div class="item-meta">
                <span :class="['status-badge', item.estado]">
                  {{ $t(`status.${item.estado}`) }}
                </span>
                
                <!-- Actions: Only if status is 'nuevo' or 'pendiente' -->
                <div v-if="canModify(item.estado)" class="item-actions">
                  <button @click="openNoteModal(item)" class="btn-icon" title="Notas">
                    <Edit3 :size="16" />
                  </button>
                  <button @click="cancelItem(item, order.id)" class="btn-icon danger" title="Cancelar">
                    <Trash2 :size="16" />
                  </button>
                </div>
              </div>
              
              <p v-if="item.notas" class="item-notes">📝 {{ item.notas }}</p>
              
              <!-- Progress Bar per Item -->
              <div class="item-progress-track">
                <div 
                  class="item-progress-fill" 
                  :class="getStatusClass(item)"
                  :style="{ width: getItemProgress(item) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

         <div v-if="activeOrders.length === 0" class="empty-orders">
          <p>{{ $t('order_status.error_no_active_order') }}</p>
        </div>
      </div>

      <!-- Actions Footer -->
      <div class="status-footer">
        <button @click="router.push(`/mesa/${tableId}/menu`)" class="btn-add-more">
          <Plus :size="20" />
          {{ $t('waiter.add_items') }}
        </button>
        
        <button v-if="canViewBill" @click="viewBill" class="btn-bill">
          <Receipt :size="20" />
          {{ $t('order_status.view_bill') }}
        </button>
      </div>
    </div>

    <!-- Note Modal -->
    <div v-if="editingItem" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ $t('customer.notes') }}</h3>
        <textarea 
          v-model="tempNote" 
          :placeholder="$t('customer.notes_placeholder')"
          rows="3"
        ></textarea>
        <div class="modal-actions">
          <button @click="editingItem = null" class="btn-cancel">{{ $t('common.cancel') }}</button>
          <button @click="saveNote" class="btn-save">{{ $t('common.save') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePedidoStore } from '@/stores/pedidoStore';
import api from '@/api';
import socket from '@/socket';
import { 
  ClipboardList, ChefHat, Utensils, CheckCircle, 
  Edit3, Trash2, Plus, Receipt, Home 
} from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const store = usePedidoStore(); // Still used for some utilities or if needed
const { t } = useI18n();

const tableId = computed(() => route.params.tableId);
const loading = ref(true);
const error = ref(null);
const localOrders = ref([]); // Local state for orders

// Filter orders is now just returning localOrders, but keeping structure if we have multiple
const activeOrders = computed(() => localOrders.value);

// Calculate overall progress status
const currentStep = computed(() => {
  const orders = activeOrders.value;
  if (orders.length === 0) return 0;
  
  // Aggregate items from all orders (usually just one active order per table)
  const allItems = orders.flatMap(o => o.items || []);
  
  if (allItems.length === 0) return 0;

  const hasCooking = allItems.some(i => ['en_cocina', 'en_preparacion'].includes(i.estado));
  const hasReady = allItems.some(i => i.estado === 'listo');
  const hasServed = allItems.some(i => i.estado === 'servido');
  
  // If ALL items are served
  if (allItems.every(i => i.estado === 'servido')) return 3;
  if (hasServed) return 3; // At least one served, maybe show served state?
  if (hasReady) return 2;
  if (hasCooking) return 1;
  return 0;
});

const steps = [
  { key: 'received', label: t('order_status.received'), icon: ClipboardList },
  { key: 'preparing', label: t('order_status.preparing'), icon: ChefHat },
  { key: 'ready', label: t('order_status.ready'), icon: Utensils },
  { key: 'served', label: t('order_status.served'), icon: CheckCircle },
];

const statusMessage = computed(() => {
  const msgs = [
    t('order_status.desc_received'),
    t('order_status.desc_preparing'),
    t('order_status.desc_ready'),
    t('order_status.desc_served')
  ];
  return msgs[currentStep.value];
});

const canViewBill = computed(() => activeOrders.value.length > 0);

const canModify = (status) => ['nuevo', 'pendiente'].includes(status);

const editingItem = ref(null);
const tempNote = ref('');

const openNoteModal = (item) => {
  editingItem.value = item;
  tempNote.value = item.notas || '';
};

const saveNote = async () => {
  if (!editingItem.value) return;
  try {
    await api.actualizarNotasItem(editingItem.value.id, tempNote.value);
    editingItem.value.notas = tempNote.value; 
    editingItem.value = null;
  } catch (e) {
    alert(t('common.error'));
  }
};

const cancelItem = async (item, orderId) => {
  if (!confirm(t('waiter.confirm_cancel'))) return;
  try {
    await api.actualizarEstadoItem(item.id, 'cancelado');
    // Refresh to update UI
    cargarEstado();
  } catch (e) {
    alert(t('common.error'));
  }
};

const cargarEstado = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await api.getMesaPedidoActual(tableId.value); // Changed from getPedidoActualMesa to getMesaPedidoActual to match original
    // console.log('📦 Estado cargado:', res.data); // Disabled to reduce noise
    
    // Si hay pedido, lo ponemos en activeOrders
    if (res.data.pedido) {
        // Log para depuración
        console.log('📦 Pedido cargado:', res.data.pedido); 
        console.log('📦 Estado del pedido:', res.data.pedido.estado);

        // Map backend response to frontend structure if needed, or use directly
        // The backend returns { pedido: {...}, items: [...] }
        // We'll attach items to the pedido object for easier handling
        const pedido = { ...res.data.pedido, items: res.data.items };
        
        // activeOrders is a computed property, so we update localOrders
        localOrders.value = [pedido];
        // currentStep is a computed property, no direct assignment needed here
        
        // Update localOrders ref for granular updates (already done above)
        // localOrders.value = [pedido]; // This line is redundant if localOrders.value = [pedido] is already done
    } else {
        localOrders.value = []; // Update localOrders, not activeOrders
    }
    
  } catch (err) {
    // 404 is expected if no active order
    if (err.response && err.response.status === 404) {
       localOrders.value = []; // Update localOrders, not activeOrders
    } else {
       console.error(err);
       error.value = t('order_status.error_title');
    }
  } finally {
    loading.value = false;
  }
};

const viewBill = () => {
  if (activeOrders.value[0]) {
    router.push(`/cuenta/${activeOrders.value[0].id}`);
  }
};

// ✅ Calcular progreso del item
const getItemProgress = (item) => {
  if (item.estado === 'servido' || item.estado === 'listo') return 100;
  if (item.estado === 'pendiente' || !item.started_at) return 5;
  
  const drift = window.__clockDrift || 0;
  // Use reactive 'now.value' instead of Date.now() to trigger updates
  const nowSync = now.value + drift; 
  const startTime = new Date(item.started_at).getTime();
  const elapsed = nowSync - startTime;
  // Fallback to 15 mins if not set
  const estimadoMs = (item.tiempo_estimado || 15) * 60 * 1000;
  
  let percent = (elapsed / estimadoMs) * 100;
  return Math.min(Math.max(percent, 5), 95);
};

const getStatusClass = (item) => {
  if (item.estado === 'servido') return 'bg-success';
  if (item.estado === 'listo') return 'bg-ready';
  if (item.estado === 'en_cocina' || item.estado === 'en_preparacion') return 'bg-cooking';
  return 'bg-pending';
};

const setupRealTime = () => {
    if (!socket.connected) socket.connect();

    socket.on('pedido_actualizado', ({ mesa_numero }) => {
        if (mesa_numero == tableId.value) cargarEstado();
    });

    socket.on('item_updated', ({ mesa_numero }) => {
        if (mesa_numero == tableId.value) cargarEstado();
    });

    // ✅ Granular updates without full reload
    socket.on('item_started', ({ mesa_numero, item_id }) => {
       if (mesa_numero == tableId.value) updateLocalItemStatus(item_id, 'en_preparacion', true);
    });
    
    socket.on('item_ready', ({ mesa_numero, item_id }) => {
       if (mesa_numero == tableId.value) updateLocalItemStatus(item_id, 'listo');
    });

    socket.on('item_served', ({ mesa_numero, item_id }) => {
       if (mesa_numero == tableId.value) updateLocalItemStatus(item_id, 'servido');
    });
    
    socket.on('connect', cargarEstado);
};

// Update local state directly
const updateLocalItemStatus = (itemId, newStatus, setStarted = false) => {
    if (!localOrders.value.length) return;
    
    localOrders.value.forEach(order => {
        if (order.items) {
            const item = order.items.find(i => i.id === itemId);
            if (item) {
                item.estado = newStatus;
                if (setStarted) item.started_at = new Date().toISOString();
            }
        }
    });
};

// Timer for progress bars
let timerInterval = null;
const now = ref(Date.now());

onMounted(() => {
  cargarEstado();
  setupRealTime();
  // Update 'now' every second to animate progress bars
  timerInterval = setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

const resetSession = () => {
    // Redirigir a welcome para iniciar nueva sesión
    router.push(`/mesa/${tableId.value}/welcome`);
};

onUnmounted(() => {
    socket.off('pedido_actualizado');
    socket.off('item_updated');
    socket.off('item_started');
    socket.off('item_ready');
    socket.off('item_served');
    if (timerInterval) clearInterval(timerInterval);
});
</script>

<style scoped>
.customer-status {
  padding: 1rem;
  background: var(--customer-bg-primary);
  min-height: 100vh;
  padding-bottom: 100px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.status-header h2 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  color: var(--customer-text-primary);
}

.table-badge {
  background: var(--customer-surface);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 700;
  color: var(--theme-color, #ff6b6b);
  box-shadow: 0 2px 10px var(--customer-shadow);
}

.progress-card {
  background: var(--customer-surface);
  padding: 1.5rem;
  border-radius: 20px;
  box-shadow: 0 4px 15px var(--customer-shadow);
  margin-bottom: 2rem;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  position: relative;
}

.progress-steps::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 30px;
  right: 30px;
  height: 2px;
  background: #f1f5f9;
  z-index: 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  opacity: 0.5;
  transition: all 0.3s;
}

.step.active, .step.completed {
  opacity: 1;
}

.step-icon {
  width: 40px;
  height: 40px;
  background: var(--customer-surface);
  border: 2px solid var(--customer-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  transition: all 0.3s;
  color: var(--customer-text-secondary);
}

.step.active .step-icon {
  border-color: var(--theme-color, #ff6b6b);
  background: var(--theme-color, #ff6b6b);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 10px rgba(255, 107, 107, 0.3);
}

.step.completed .step-icon {
  border-color: var(--theme-color, #ff6b6b);
  color: var(--theme-color, #ff6b6b);
}

.step-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--customer-text-secondary);
}

.status-message {
  text-align: center;
  color: var(--customer-text-secondary);
  font-weight: 500;
  background: var(--customer-bg-tertiary);
  padding: 1rem;
  border-radius: 12px;
}

.order-list h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--customer-text-primary);
}

.order-group {
  background: var(--customer-surface);
  border-radius: 16px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px var(--customer-shadow);
  overflow: hidden;
}

.order-item {
  padding: 1rem;
  border-bottom: 1px solid var(--customer-border);
}

.item-main {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.qty {
  font-weight: 800;
  color: var(--theme-color);
  width: 30px;
}

.name {
  flex: 1;
  font-weight: 600;
  color: var(--customer-text-primary);
}
.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-badge {
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #64748b;
}

.status-badge.nuevo { background: #e0f2fe; color: #0284c7; }
.status-badge.en_cocina { background: #fef9c3; color: #ca8a04; }
.status-badge.listo { background: #dcfce7; color: #16a34a; }
.status-badge.cancelado { background: #fee2e2; color: #dc2626; text-decoration: line-through; }

.item-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.btn-icon:hover { opacity: 1; }
.btn-icon.danger { color: #dc2626; }

.item-notes {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  color: #64748b;
  font-style: italic;
  padding-left: 2rem;
}

.status-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: var(--customer-surface);
  box-shadow: 0 -4px 20px var(--customer-shadow);
  display: flex;
  gap: 1rem;
  justify-content: center;
  z-index: 100;
}

.btn-add-more, .btn-bill {
  flex: 1;
  max-width: 200px;
  padding: 1rem;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
}

.btn-add-more {
  background: var(--theme-color, #ff6b6b);
  color: white;
}

.btn-bill {
  background: var(--customer-bg-tertiary);
  color: var(--customer-text-primary);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: var(--customer-surface);
  padding: 1.5rem;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
}

textarea {
  width: 100%;
  border: 2px solid var(--customer-border);
  border-radius: 8px;
  padding: 0.8rem;
  margin: 1rem 0;
  font-family: inherit;
  resize: none;
  background: var(--customer-bg-tertiary);
  color: var(--customer-text-primary);
}

textarea:focus {
  border-color: var(--theme-color);
  outline: none;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-cancel, .btn-save {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel { background: var(--customer-bg-tertiary); color: var(--customer-text-secondary); }
.btn-save { background: var(--theme-color, #ff6b6b); color: white; }

/* Progress Bar Styles */
.item-progress-track {
  height: 4px;
  background: #f1f5f9;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 10px;
}

.item-progress-fill {
  height: 100%;
  transition: width 0.5s linear;
}

.item-progress-fill.bg-success { background: #10b981; } /* Green */
.item-progress-fill.bg-ready { background: #10b981; }
.item-progress-fill.bg-cooking { background: #f59e0b; } /* Orange */
.item-progress-fill.bg-pending { background: #cbd5e1; } /* Gray */

/* Paid State */
/* Paid State */
.paid-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80vh;
  text-align: center;
}

.paid-success {
  background: var(--customer-surface);
  padding: 3rem;
  border-radius: 24px;
  box-shadow: 0 10px 25px var(--customer-shadow-lg);
  max-width: 400px;
  width: 90%;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.icon-success {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.subtext {
  color: #64748b;
  margin-bottom: 2rem;
}

.btn-home {
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  border: none;
  background: var(--theme-color, #ff6b6b);
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-home:active {
  transform: scale(0.98);
}

.mt-4 { margin-top: 2rem; }


</style>
