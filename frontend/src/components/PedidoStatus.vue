<template>
  <div class="pedido-status-container">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>{{ $t('common.loading_status') }}</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="icon">❌</div>
      <h3>{{ $t('order_status.error_title') }}</h3>
      <p>{{ error }}</p>
      <button @click="cargarPedido" class="btn btn-primary">{{ $t('common.retry') }}</button>
    </div>

    <div v-else-if="pedido" class="status-content">
      <div class="header">
        <h1>🍽️ {{ $t('order_status.title') }}</h1>
        <div class="mesa-badge">{{ $t('common.table') }} {{ pedido.mesa_numero }}</div>
      </div>

      <!-- Estado General -->
      <div class="status-card">
        <div class="status-icon">
          <span v-if="pedido.estado === 'nuevo'">📝</span>
          <span v-else-if="pedido.estado === 'en_cocina'">👨‍🍳</span>
          <span v-else-if="pedido.estado === 'listo'">✅</span>
          <span v-else-if="pedido.estado === 'servido'">🍽️</span>
          <span v-else-if="pedido.estado === 'pagado'">💰</span>
        </div>
        <div class="status-text">
          <h2>{{ getEstadoTexto(pedido.estado) }}</h2>
          <p>{{ getEstadoDescripcion(pedido.estado) }}</p>
          <div v-if="pedido.estado === 'en_cocina' || pedido.estado === 'listo'" class="timer-badge">
            ⏱️ {{ getTiempoTranscurrido(pedido.tiempoTranscurrido) }}
          </div>
          <!-- Opcional: Mostrar cuánto tardó si ya se sirvió -->
          <div v-else-if="pedido.estado === 'servido'" class="timer-badge success">
            🏁 {{ $t('order_status.took') }} {{ pedido.tiempoTranscurrido }} {{ $t('common.min') }}
          </div>
        </div>
      </div>

      <!-- Barra de Progreso -->
      <div class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: porcentajeProgreso + '%' }"></div>
        </div>
        <div class="progress-labels">
          <span>{{ $t('order_status.received') }}</span>
          <span>{{ $t('order_status.preparing') }}</span>
          <span>{{ $t('order_status.ready') }}</span>
        </div>
      </div>

      <!-- Lista de Items -->
      <div class="items-section">
        <h3>{{ $t('order_status.your_order') }}</h3>
        <div class="items-list">
          <div v-for="item in items" :key="item.id" class="item-row-dynamic">
            <div class="item-header">
              <div class="item-name-qty">
                <span class="qty">{{ item.cantidad }}x</span>
                <span class="name">{{ item.nombre }}</span>
              </div>
              <span class="status-badge" :class="getStatusClass(item)">{{ getStatusText(item) }}</span>
            </div>
            
            <!-- Barra de progreso individual -->
            <div class="item-progress-track">
              <div 
                class="item-progress-fill" 
                :class="getStatusClass(item)"
                :style="{ width: getItemProgress(item) + '%' }"
              ></div>
            </div>
          </div>
        </div>
        
        <!-- Estadísticas de Progreso -->
        <div v-if="estadisticas" class="stats-summary">
          <div class="stat-item">
            <span class="stat-label">{{ $t('order_status.stats_served') }}</span>
            <span class="stat-value">{{ estadisticas.servidos }}/{{ estadisticas.total_items }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ $t('order_status.stats_ready') }}</span>
            <span class="stat-value">{{ estadisticas.listos }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ $t('order_status.stats_preparing') }}</span>
            <span class="stat-value">{{ estadisticas.en_preparacion }}</span>
          </div>
        </div>
      </div>

      <!-- Botón Pedir Cuenta -->
      <div v-if="pedido.estado === 'servido'" class="pedir-cuenta-section">
        <button 
          @click="pedirCuenta" 
          class="btn-pedir-cuenta"
          :disabled="cuentaSolicitada"
        >
          {{ cuentaSolicitada ? '✅ ' + $t('order_status.bill_requested') : '💳 ' + $t('order_status.request_bill') }}
        </button>
        <p v-if="cuentaSolicitada" class="cuenta-solicitada-msg">
          {{ $t('order_status.waiter_notified') }}
        </p>
      </div>

      <!-- NUEVO: Botón Ver cuenta (cuando haya pedido) -->
      <div v-if="pedido.estado === 'servido'" class="pedir-cuenta-section" style="margin-top: 12px;">
        <button 
          @click="verCuenta"
          class="btn-pedir-cuenta"
          style="background: #4b5563; box-shadow: none;"
        >
          🧾 {{ $t('order_status.view_bill') }}
        </button>
      </div>

      <div class="footer-note">
        <p>{{ $t('order_status.thank_you') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n'; // Import useI18n
import api from '../api';
import socket from '../socket';
  
const { t } = useI18n(); // Destructure t function

// Detectar tipo de ruta y extraer ID
const path = window.location.pathname;
const pathParts = path.split('/');
const routeType = pathParts[1]; // 'pedido' o 'mesa'
const routeId = pathParts[2]; // ID del pedido o número de mesa

const pedido = ref(null);
const loading = ref(true);
const error = ref(null);
const esMesa = routeType === 'mesa';
const mesaNumero = ref(esMesa ? routeId : null);
const items = ref([]);
const estadisticas = ref(null);
const now = ref(Date.now());
const cuentaSolicitada = ref(false);
const cargarPedido = async () => {
  loading.value = true;
  error.value = null;
  try {
    let response;
    
    console.log('🎲 Ruta actual:', routeType, 'ID:', routeId); // ✅ DEBUG
    
    if (esMesa) {
      console.log('📞 Llamando a getMesaPedidoActual'); // ✅ DEBUG
      response = await api.getMesaPedidoActual(routeId);
    } else {
      console.log('📞 Llamando a getPedidoStatusPublico'); // ✅ DEBUG
      response = await api.getPedidoStatusPublico(routeId);
    }
    
    pedido.value = response.data.pedido;
    items.value = response.data.items;
    estadisticas.value = response.data.estadisticas;
    // ✅ DEBUG
    console.log('📊 Respuesta:', {
      tiempoTranscurrido: pedido.value.tiempoTranscurrido,
      estado: pedido.value.estado,
      started_at: pedido.value.started_at
    });

  } catch (err) {
    if (esMesa && err.response?.status === 404) {
      error.value = t('order_status.error_no_active_order');
      // No console.error for expected 404s
    } else {
      error.value = t('order_status.error_not_found');
      console.error(err);
    }
  } finally {
    loading.value = false;
  }
};

const porcentajeProgreso = computed(() => {
  if (!estadisticas.value) return 0;
  return estadisticas.value.progreso_porcentaje || 0;
});

const getEstadoTexto = (estado) => {
  const textos = {
    nuevo: t('order_status.received'),
    en_cocina: t('order_status.preparing'),
    listo: t('order_status.ready'),
    servido: t('order_status.served'),
    pagado: t('order_status.paid'),
    listo_pagar: t('status.listo_pagar'),
    en_caja: t('status.en_caja')
  };
  return textos[estado] || estado;
};

const getEstadoDescripcion = (estado) => {
  const desc = {
    nuevo: t('order_status.desc_received'),
    en_cocina: t('order_status.desc_preparing'),
    listo: t('order_status.desc_ready'),
    servido: t('order_status.desc_served'),
    pagado: t('order_status.desc_paid'),
    listo_pagar: t('order_status.waiter_notified'), 
    en_caja: t('order_status.desc_paid') // Reusing paid or similar description, or add new key if strict
  };
  return desc[estado] || '';
};

// ✅ Simplificado al máximo
const getTiempoTranscurrido = (tiempoMinutos) => {
  if (tiempoMinutos < 1) return t('common.just_now') || 'Ahora mismo';
  if (tiempoMinutos === 1) return `1 ${t('common.min')}`;
  return `${tiempoMinutos} ${t('common.min')}`;
};

const verCuenta = () => {
  if (!pedido.value) return;
  const baseUrl = window.location.origin;
  // Ruta que definiste en el router para CuentaView.vue
  const url = `${baseUrl}/cuenta/${pedido.value.id}`;
  window.open(url, '_blank');
};

// ✅ MODIFICAR: getItemProgress igual
const getItemProgress = (item) => {
  if (item.estado === 'servido' || item.estado === 'listo') return 100;
  if (item.estado === 'pendiente' || !item.started_at) return 5;
  
  const drift = window.__clockDrift || 0;
  const nowSync = Date.now() + drift;
  const startTime = new Date(item.started_at).getTime();
  const elapsed = nowSync - startTime;
  const estimadoMs = (item.tiempo_estimado || 15) * 60 * 1000;
  
  let percent = (elapsed / estimadoMs) * 100;
  return Math.min(Math.max(percent, 5), 95);
};

const getStatusText = (item) => {
  if (item.estado === 'servido') return t('order_status.enjoying');
  if (item.estado === 'listo') return t('order_status.ready_serve');
  if (item.estado === 'en_preparacion') return t('order_status.cooking');
  return t('order_status.waiting');
};

const getStatusClass = (item) => {
  if (item.estado === 'servido') return 'bg-success';
  if (item.estado === 'listo') return 'bg-ready';
  if (item.estado === 'en_preparacion') return 'bg-cooking';
  return 'bg-pending';
};

const pedirCuenta = () => {
  if (!pedido.value || cuentaSolicitada.value) return;
  
  cuentaSolicitada.value = true;
  
  // Emitir evento socket para notificar al mesero
  socket.emit('solicitar_cuenta', {
    pedido_id: pedido.value.id,
    mesa_numero: pedido.value.mesa_numero,
    mesero_id: pedido.value.usuario_mesero_id
  });
  
  // Feedback visual
  alert('\u2705 Tu mesero ha sido notificado y se acercar\u00e1 pronto para el pago.');
};

const setupRealTime = () => {
    if (!socket.connected) socket.connect();

    socket.on('pedido_actualizado', ({ id, estado: nuevoEstado }) => {
        if (pedido.value && pedido.value.id === id) {
            pedido.value.estado = nuevoEstado;
            cargarPedido();
        }
    });

    socket.on('item_started', ({ item_id, pedido_id }) => {
        if (pedido.value && pedido.value.id === pedido_id) {
            cargarPedido();
        }
    });

    socket.on('item_ready', ({ item_id, pedido_id }) => {
        if (pedido.value && pedido.value.id === pedido_id) {
            cargarPedido();
        }
    });

    socket.on('item_served', ({ item_id, pedido_id }) => {
        if (pedido.value && pedido.value.id === pedido_id) {
            cargarPedido();
        }
    });
};

let timerInterval = null;

onMounted(() => {
  cargarPedido();
  setupRealTime();
  
  // Actualizar 'now' cada segundo para timers en tiempo real
  timerInterval = setInterval(() => {
    now.value = Date.now();
  }, 1000); // Cada segundo para actualización fluida
});

onUnmounted(() => {
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
.pedido-status-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: var(--bg-color);
  font-family: 'Inter', sans-serif;
  color: var(--text-primary);
}

.loading, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  text-align: center;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.header {
  text-align: center;
  margin-bottom: 24px;
}

.header h1 {
  font-size: 24px;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.mesa-badge {
  display: inline-block;
  background: #e0e7ff;
  color: #4338ca;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
}

.status-card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  border: 1px solid var(--border-color);
}

.status-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.status-text h2 {
  font-size: 20px;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.status-text p {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 12px;
}

.timer-badge {
  display: inline-block;
  background: #f3f4f6;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
  margin-top: 8px;
}

.progress-section {
  margin-bottom: 32px;
}

.progress-bar {
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #10b981);
  transition: width 0.5s ease-out;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.items-section {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
}

.items-section h3 {
  font-size: 16px;
  margin-bottom: 16px;
  margin-bottom: 16px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 12px;
}

.item-row-dynamic {
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.item-row-dynamic:last-child {
  border-bottom: none;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-name-qty {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty {
  font-weight: 700;
  color: var(--text-secondary);
  font-size: 14px;
}

.name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
}

.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 10px;
  white-space: nowrap;
}

.status-badge.bg-success { color: #065f46; background: #d1fae5; }
.status-badge.bg-ready { color: #065f46; background: #d1fae5; }
.status-badge.bg-cooking { color: #92400e; background: #fef3c7; }
.status-badge.bg-pending { color: #6b7280; background: #f3f4f6; }

.item-progress-track {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.item-progress-fill {
  height: 100%;
  transition: width 1s linear;
}

.item-progress-fill.bg-success { background: #10b981; }
.item-progress-fill.bg-ready { background: #10b981; }
.item-progress-fill.bg-cooking { background: #f59e0b; }
.item-progress-fill.bg-pending { background: #d1d5db; }

.stats-summary {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  padding-top: 16px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 11px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.footer-note {
  text-align: center;
  margin-top: 40px;
  color: #9ca3af;
  font-size: 12px;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.pedir-cuenta-section {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;
  margin-top: 24px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-color);
}

.btn-pedir-cuenta {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  width: 100%;
}

.btn-pedir-cuenta:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.btn-pedir-cuenta:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  box-shadow: none;
}

.cuenta-solicitada-msg {
  margin-top: 12px;
  color: #059669;
  font-size: 14px;
  font-weight: 600;
}
</style>
