<template>
  <div class="cocinero-panel">
    <div class="panel-header">
      <h2>👨‍🍳 Panel de Cocina</h2>
      <div class="header-info">
        <span class="badge" :class="{ 'badge-alert': pedidosNuevos.length > 0 }">
          🆕 {{ pedidosNuevos.length }} nuevos
        </span>
        <span class="badge">🍳 {{ pedidosEnCocina.length }} en preparación</span>
        <button @click="actualizarPedidos" class="btn btn-secondary" :disabled="loading">
          🔄
        </button>
      </div>
    </div>

    <div class="panel-content">
      <div v-if="loading" class="loading">Cargando pedidos...</div>

      <template v-else>
        <!-- Pedidos Nuevos -->
        <div class="section">
          <h3>🆕 Pedidos Nuevos</h3>
          <div v-if="pedidosNuevos.length === 0" class="empty-state">
            Sin pedidos nuevos
          </div>
          <div v-else class="pedidos-columns">
            <div v-for="pedido in pedidosNuevos" :key="pedido.id" class="pedido-card">
              <div class="card-header">
                <span class="mesa-num">🪑 Mesa {{ pedido.mesa_numero }}</span>
                <span class="mesero-info">👤 {{ pedido.mesero || 'Sin asignar' }}</span>
                <button
                  @click="iniciarPedido(pedido.id)"
                  class="btn btn-warning btn-small"
                >
                  Iniciar
                </button>
              </div>
              <div class="items-list">
                <div v-for="item in pedido.items" :key="item.id" class="item-line">
                  <span class="qty">{{ item.cantidad }}x</span>
                  <span class="name">{{ item.nombre }}</span>
                </div>
              </div>
              <div v-if="pedido.notas" class="notas">📝 {{ pedido.notas }}</div>
            </div>
          </div>
        </div>

        <!-- Pedidos en Preparación -->
        <div class="section">
          <h3>🍳 En Preparación</h3>
          <div v-if="pedidosEnCocina.length === 0" class="empty-state">
            Sin pedidos en preparación
          </div>
          <div v-else class="pedidos-columns">
            <div v-for="pedido in pedidosEnCocina" :key="pedido.id" class="pedido-card pedido-cooking">
              <div class="card-header">
                <span class="mesa-num">🪑 Mesa {{ pedido.mesa_numero }}</span>
                <span class="mesero-info">👤 {{ pedido.mesero || 'Sin asignar' }}</span>
              </div>
              
              <!-- Items individuales (ahora cada uno es un registro separado) -->
              <div class="items-list-individual">
                <div 
                  v-for="(item, index) in pedido.items" 
                  :key="item.id"
                  :class="['individual-item', `estado-${item.estado || 'pendiente'}`]"
                >
                  <div class="item-info-row">
                    <span class="item-nombre">{{ item.nombre }}</span>
                    <div class="item-estado-badge">
                      <span v-if="!item.estado || item.estado === 'pendiente'">⚪ Pendiente</span>
                      <span v-else-if="item.estado === 'en_preparacion'" class="timer">
                        🟡 {{ getTiempoTranscurrido(item.started_at) }}
                      </span>
                      <span v-else-if="item.estado === 'listo'">🟢 Listo</span>
                      <span v-else-if="item.estado === 'servido'">✅ Servido</span>
                    </div>
                  </div>
                  
                  <div class="item-actions">
                    <button
                      v-if="!item.estado || item.estado === 'pendiente'"
                      @click="iniciarItem(item.id)"
                      class="btn-item btn-start"
                    >
                      Iniciar
                    </button>
                    <button
                      v-else-if="item.estado === 'en_preparacion'"
                      @click="completarItem(item.id)"
                      class="btn-item btn-complete"
                    >
                      Completar
                    </button>
                    <span v-else-if="item.estado === 'listo'" class="waiting-text">
                      Esperando mesero...
                    </span>
                    <span v-else-if="item.estado === 'servido'" class="served-text">
                      ✓ Servido
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="progreso-bar">
                <div class="progreso-fill" :style="{ width: porcentajePedido(pedido) + '%' }"></div>
                <span class="progreso-text">{{ porcentajePedido(pedido) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>

  <div class="notificaciones-container">
    <div v-for="notif in notificaciones" :key="notif.id" :class="['notificacion', `notif-${notif.tipo}`]">
      <span class="badge">{{ notif.tipo }}</span>
      <span>{{ notif.titulo }}</span>
      <button @click="cerrarNotificacion(notif.id)" class="btn-cerrar-notif">✕</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { usePedidoStore } from '../stores/pedidoStore';
import { useNotificaciones } from '../composables/useNotificaciones';
import api from '../api';
import socket from '../socket';

const { notificaciones, cerrarNotificacion } = useNotificaciones('cocinero');

const pedidoStore = usePedidoStore();
const loading = ref(false);
const now = ref(Date.now()); // Reactive time reference
let autoRefreshInterval = null;
let timerInterval = null;

const pedidosNuevos = computed(() => pedidoStore.pedidosPorEstado.nuevo || []);
const pedidosEnCocina = computed(() => {
    // Mostrar pedidos en_cocina Y listo (hasta que el mesero los marque como servidos)
    const enCocina = pedidoStore.pedidosPorEstado.en_cocina || [];
    const listos = pedidoStore.pedidosPorEstado.listo || [];
    return [...enCocina, ...listos];
});

const actualizarPedidos = async () => {
  loading.value = true;
  try {
    await pedidoStore.cargarPedidosActivos();
  } catch (err) {
    console.error('Error cargando pedidos:', err);
  } finally {
    loading.value = false;
  }
};

const iniciarPedido = async (pedidoId) => {
  try {
    await pedidoStore.actualizarEstadoPedido(pedidoId, 'en_cocina');
  } catch (err) {
    alert('Error iniciando pedido');
  }
};

// Ya no necesitamos agrupar - cada item es un registro individual

// Iniciar preparación de un item individual
const iniciarItem = async (itemId) => {
  try {
    await api.iniciarItem(itemId);
    await actualizarPedidos();
  } catch (err) {
    console.error('Error iniciando item:', err);
    alert('Error al iniciar item');
  }
};

// Completar preparación de un item individual
const completarItem = async (itemId) => {
  try {
    await api.completarItem(itemId);
    await actualizarPedidos();
  } catch (err) {
    console.error('Error completando item:', err);
    alert('Error al completar item');
  }
};

// Calcular tiempo transcurrido desde que se inició (usa now.value para reactividad)
const getTiempoTranscurrido = (startedAt) => {
  if (!startedAt) return '0min';
  const start = new Date(startedAt).getTime();
  const diffMinutes = Math.floor((now.value - start) / 60000);
  return `${diffMinutes}min`;
};

// Calcular porcentaje de progreso del pedido
const porcentajePedido = (pedido) => {
  const totalItems = pedido.items.length;
  const itemsCompletados = pedido.items.filter(item => 
    item.estado === 'listo' || item.estado === 'servido'
  ).length;
  
  return totalItems > 0 ? Math.round((itemsCompletados / totalItems) * 100) : 0;
};

onMounted(() => {
  actualizarPedidos();
  
  // Socket listeners para actualizaciones en tiempo real
  if (!socket.connected) socket.connect();
  
  socket.on('nuevo_pedido', () => {
      console.log('🆕 Nuevo pedido recibido en cocina');
      pedidoStore.cargarPedidosActivos();
  });
  
  socket.on('pedido_actualizado', () => {
      console.log('📝 Pedido actualizado en cocina');
      pedidoStore.cargarPedidosActivos();
  });
  
  socket.on('item_started', () => {
      console.log('▶️ Item iniciado');
      pedidoStore.cargarPedidosActivos();
  });
  
  socket.on('item_ready', () => {
      console.log('✅ Item completado');
      pedidoStore.cargarPedidosActivos();
  });
  
  socket.on('item_served', () => {
      console.log('🍽️ Item servido');
      pedidoStore.cargarPedidosActivos();
  });
  
  // Actualizar 'now' cada segundo para timers en tiempo real
  timerInterval = setInterval(() => {
    now.value = Date.now();
  }, 1000); // Cada segundo para actualización fluida
});

onUnmounted(() => {
  socket.off('nuevo_pedido');
  socket.off('pedido_actualizado');
  socket.off('item_started');
  socket.off('item_ready');
  socket.off('item_served');
  
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});
</script>

<style scoped>
.cocinero-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.badge-alert {
  background: #ef4444;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #374151;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}

.pedidos-columns {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}

.pedido-card {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
}

.pedido-cooking {
  border-color: #fbbf24;
  background: #fffbeb;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.mesa-num {
  font-weight: 700;
  font-size: 16px;
  color: #1f2937;
}

.mesero-info {
  font-size: 13px;
  color: #6b7280;
}

.items-list {
  margin-bottom: 12px;
}

.item-line {
  padding: 6px 0;
  display: flex;
  gap: 8px;
}

.qty {
  font-weight: 700;
  color: #f59e0b;
  min-width: 30px;
}

.name {
  flex: 1;
  color: #374151;
}

.notas {
  background: #fef3c7;
  padding: 8px;
  border-radius: 4px;
  font-size: 13px;
  color: #92400e;
  margin-top: 8px;
}

/* Individual Items Styles */
.item-group {
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.item-group-header {
  background: #f3f4f6;
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
}

.item-group-name {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.individual-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
}

.individual-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  border: 2px solid #e5e7eb;
  background: white;
  min-width: 200px;
  transition: all 0.2s;
}

.individual-item.estado-pendiente {
  border-color: #d1d5db;
}

.individual-item.estado-en_preparacion {
  border-color: #fbbf24;
  background: #fffbeb;
}

.individual-item.estado-listo {
  border-color: #10b981;
  background: #ecfdf5;
}

.individual-item.estado-servido {
  border-color: #6b7280;
  background: #f3f4f6;
  opacity: 0.7;
}

.item-number {
  font-weight: 700;
  color: #6b7280;
  font-size: 12px;
  min-width: 24px;
}

.item-estado-badge {
  flex: 1;
  font-size: 13px;
}

.timer {
  color: #f59e0b;
  font-weight: 600;
}

.item-actions {
  display: flex;
  gap: 4px;
}

.btn-item {
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-start {
  background: #fbbf24;
  color: white;
}

.btn-start:hover {
  background: #f59e0b;
}

.btn-complete {
  background: #10b981;
  color: white;
}

.btn-complete:hover {
  background: #059669;
}

.waiting-text, .served-text {
  font-size: 11px;
  color: #6b7280;
  font-style: italic;
}

.progreso-bar {
  position: relative;
  height: 24px;
  background: #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 12px;
}

.progreso-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  transition: width 0.3s ease;
}

.progreso-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: 700;
  color: #1f2937;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-warning:hover {
  background: #d97706;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn-small {
  padding: 6px 12px;
  font-size: 13px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

/* Notificaciones */
.notificaciones-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
}

.notificacion {
  background: white;
  border-left: 4px solid #3b82f6;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notif-nuevo {
  border-left-color: #10b981;
}

.btn-cerrar-notif {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #9ca3af;
  padding: 0;
  margin-left: auto;
}

.btn-cerrar-notif:hover {
  color: #374151;
}

@media (max-width: 768px) {
  .pedidos-columns {
    grid-template-columns: 1fr;
  }
  
  .individual-items {
    flex-direction: column;
  }
  
  .individual-item {
    min-width: 100%;
  }
}
</style>
