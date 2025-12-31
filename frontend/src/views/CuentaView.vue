<template>
  <div class="cuenta-container">
    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ $t('bill.loading') }}</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-state">
      <div class="icon-error">❌</div>
      <h3>{{ $t('bill.error_title') }}</h3>
      <p>{{ error }}</p>
      <button @click="volverAtras" class="btn-secondary">{{ $t('common.back') }}</button>
    </div>

    <!-- Cuenta OK -->
    <div v-else-if="pedido" class="cuenta-content">
      <header class="header">
        <div class="header-top">
          <button @click="volverAtras" class="btn-icon-back">
            <ArrowLeft :size="24" />
          </button>
          <h1>{{ $t('bill.title') }}</h1>
          <div class="placeholder"></div> <!-- Spacer for center alignment -->
        </div>
        
        <div class="header-badges">
          <span class="badge table-badge">Mesa {{ pedido.mesa_numero }}</span>
          <span class="badge id-badge">#{{ pedido.id.slice(-6) }}</span>
        </div>
      </header>

      <!-- Estado en Tarjeta -->
      <div class="status-card">
        <div class="status-row">
          <div class="status-icon-wrapper">
            <component :is="getStatusIcon(pedido.estado)" :size="24" />
          </div>
          <div class="status-details">
            <span class="label">{{ $t('bill.status') }}</span>
            <span class="value">{{ getEstadoTexto(pedido.estado) }}</span>
          </div>
        </div>
        <div class="divider-vertical"></div>
        <div class="status-details right">
          <span class="label">{{ $t('bill.total') }}</span>
          <span class="value-highlight">${{ total.toLocaleString() }}</span>
        </div>
      </div>

      <!-- Lista de Items -->
      <div class="bill-card">
        <h3>{{ $t('bill.details_title') }}</h3>
        <div class="items-list">
          <div v-for="item in itemsAgrupados" :key="item.nombre" class="item-row">
            <div class="item-col-main">
              <span class="qty-badge">{{ item.cantidad }}x</span>
              <span class="item-name">{{ item.nombre }}</span>
            </div>
            <div class="item-price">${{ (item.precio * item.cantidad).toLocaleString() }}</div>
          </div>
        </div>

        <div class="divider-dashed"></div>

        <div class="summary-section">
          <div class="summary-row">
            <span>{{ $t('bill.subtotal') }}</span>
            <span>${{ (pedido.subtotal || total).toLocaleString() }}</span>
          </div>
          <div class="summary-row">
            <span>{{ $t('bill.tip') }} ({{ calcularPorcentajePropina() }}%)</span>
            <span>${{ (pedido.propina_monto || 0).toLocaleString() }}</span>
          </div>
          <div class="divider-solid"></div>
          <div class="total-row">
            <span>{{ $t('bill.total_pay') }}</span>
            <span class="total-amount">${{ total.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="actions-section" v-if="pedido.estado === 'servido' || pedido.estado === 'listo_pagar'">
        <button 
          @click="pedirCuenta" 
          class="btn-primary"
          :disabled="cuentaSolicitada || pedido.estado === 'listo_pagar'"
          :class="{ 'requested': cuentaSolicitada || pedido.estado === 'listo_pagar' }"
        >
          <Receipt v-if="!cuentaSolicitada" :size="20" />
          <CheckCheck v-else :size="20" />
          {{ getButtonText() }}
        </button>
        <p v-if="cuentaSolicitada || pedido.estado === 'listo_pagar'" class="info-msg">
          {{ $t('bill.requested_msg') }}
        </p>
      </div>

      <div class="footer">
        <p>{{ $t('bill.footer') }} {{ title }}</p>
        <div class="date">{{ formatFecha(pedido.created_at) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api';
import socket from '../socket';
import { useI18n } from 'vue-i18n';
import { ArrowLeft, Receipt, CheckCheck, Clock, CheckCircle, Utensils, DollarSign } from 'lucide-vue-next';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const title = import.meta.env.VITE_APP_TITLE || 'Restaurante';

const pedido = ref(null);
const items = ref([]);
const loading = ref(true);
const error = ref(null);
const cuentaSolicitada = ref(false);

// ✅ FIX: Initialize cuentaId as ref, will be set in onMounted when router is ready
const cuentaId = ref(null);
const esMeseroLogueado = ref(false);

const volverAtras = () => {
  if (esMeseroLogueado.value) {
    router.push('/');
  } else if (pedido.value && pedido.value.mesa_numero) {
    // ✅ REDIRECT TO NEW API
    router.push(`/mesa/${pedido.value.mesa_numero}/status`);
  } else {
    // Fallback logic
    router.go(-1);
  }
};

const detectarLogin = () => {
  try {
    // ⚠️ CRITICAL FIX: Backend currently does not return token, only user data.
    // We must rely on 'usuario' object presence for client-side auth state.
    const usuario = localStorage.getItem('usuario');
    
    console.log('🔍 CuentaView - Auth Debug:', { usuario });

    if (usuario) {
       const userObj = JSON.parse(usuario);
       // Simple validation: if user has an ID and role, consider them logged in
       if (userObj.id && userObj.rol) {
           esMeseroLogueado.value = true;
           console.log('✅ User detected as staff:', userObj.rol);
           return;
       }
    }
    
    esMeseroLogueado.value = false;
    console.log('❌ No valid staff session found');
  } catch (e) {
    console.error('Error detecting login:', e);
    esMeseroLogueado.value = false;
  }
};

const itemsAgrupados = computed(() => {
  const grupos = {};
  (items.value || []).forEach(item => {
    // Use ID if available to distinguish distinct items if necessary, 
    // but for bill grouping by name/price is standard
    const key = item.nombre + '-' + item.precio_unitario; 
    if (!grupos[key]) {
      grupos[key] = {
        nombre: item.nombre,
        precio: Number(item.precio_unitario || 0),
        cantidad: 0,
      };
    }
    grupos[key].cantidad += (item.cantidad || 1);
  });
  return Object.values(grupos);
});

const total = computed(() => parseFloat(pedido.value?.total || 0));

const cargarPedido = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await api.getPedidoStatusPublico(cuentaId.value);
    pedido.value = response.data.pedido;
    items.value = response.data.items || [];
    
    // Check if already requested based on state
    if (pedido.value.estado === 'listo_pagar') {
      cuentaSolicitada.value = true;
    }
    
    // Redirect to customer status if order is paid
    if (pedido.value.estado === 'pagado') {
      // Get table number from the order to redirect to status page
      const tableNumber = pedido.value.mesa_numero;
      router.push(`/mesa/${tableNumber}/status`);
    }
  } catch (err) {
    console.error('Error loading bill:', err);
    error.value = t('bill.error_msg');
  } finally {
    loading.value = false;
  }
};

const getStatusIcon = (estado) => {
  switch(estado) {
    case 'pagado': return CheckCircle;
    case 'listo_pagar': return DollarSign;
    case 'servido': return Utensils;
    default: return Clock;
  }
};

const getEstadoTexto = (estado) => {
  const code = `status.${estado}`;
  // Simple fallback logic if translation missing
  return t(code) !== code ? t(code) : estado;
};

const formatFecha = (fecha) => {
  return new Date(fecha).toLocaleString('es-CO', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });
};

const getButtonText = () => {
  if (cuentaSolicitada.value || (pedido.value && pedido.value.estado === 'listo_pagar')) {
    return t('bill.requested_btn');
  }
  return t('bill.request_btn');
};

const pedirCuenta = () => {
  if (!pedido.value || cuentaSolicitada.value) return;
  
  cuentaSolicitada.value = true;
  
  socket.emit('solicitar_cuenta', {
    pedido_id: pedido.value.id,
    mesa_numero: pedido.value.mesa_numero,
    mesero_id: pedido.value.usuario_mesero_id
  });
};

const calcularPorcentajePropina = () => {
  if (!pedido.value?.subtotal || !pedido.value?.propina_monto) return 10;
  const subtotal = parseFloat(pedido.value.subtotal);
  const propina = parseFloat(pedido.value.propina_monto);
  if (subtotal === 0) return 0;
  return Math.round((propina / subtotal) * 100);
};

onMounted(() => {
  // ✅ FIX: Get ID from route params AFTER router is fully initialized
  cuentaId.value = route.params.id;
  
  // ✅ DEBUG: Log route information
  console.log('🔍 onMounted - Route params:', route.params);
  console.log('🔍 onMounted - Route path:', route.path);
  console.log('🔍 onMounted - Route name:', route.name);
  console.log('🔍 onMounted - cuentaId:', cuentaId.value);
  
  if (cuentaId.value) {
    cargarPedido();
    detectarLogin();
    
    // Connect Socket.IO for real-time updates
    if (!socket.connected) socket.connect();
    
    // Listen for order status updates
    socket.on('pedido_actualizado', (data) => {
      // Only update if it's this specific order
      if (data.id === cuentaId.value) {
        console.log('📝 Order status updated:', data);
        // Reload order data to get latest status
        cargarPedido();
      }
    });
    
    // Listen for payment updates
    socket.on('pedido_pagado', (data) => {
      if (data.pedido_id === cuentaId.value) {
        console.log('💰 Payment registered:', data);
        // Reload order data to reflect payment
        cargarPedido();
      }
    });
  } else {
    console.error('❌ No cuentaId found in route params!');
    error.value = t('bill.invalid_id');
    loading.value = false;
  }
});

onUnmounted(() => {
  // Clean up socket listeners
  socket.off('pedido_actualizado');
  socket.off('pedido_pagado');
});
</script>

<style scoped>
.cuenta-container {
  min-height: 100vh;
  background: var(--bg-color);
  font-family: 'Inter', sans-serif;
  color: var(--text-primary);
  padding-bottom: 40px;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  gap: 1rem;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top-color: var(--theme-color, #ff6b6b);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.cuenta-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
}

/* Header */
.header {
  margin-bottom: 1.5rem;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.header-top h1 {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
  color: var(--text-primary);
}

.placeholder { width: 40px; } 

.btn-icon-back {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.btn-icon-back:active { transform: scale(0.95); }

.header-badges {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.table-badge { background: #fee2e2; color: #ef4444; }
.id-badge { background: var(--bg-secondary); color: var(--text-secondary); }

/* Cards */
.status-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05); /* Usar sombra genérica o variable global si existe */
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);
}

.status-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-icon-wrapper {
  background: var(--bg-secondary);
  padding: 10px;
  border-radius: 12px;
  color: var(--theme-color, #ff6b6b);
}

.status-details {
  display: flex;
  flex-direction: column;
}

.label { font-size: 0.8rem; color: var(--text-secondary); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
.value { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }
.value-highlight { font-size: 1.2rem; font-weight: 800; color: var(--theme-color, #ff6b6b); }

.divider-vertical {
  width: 1px;
  height: 40px;
  background: var(--border-color);
}

.bill-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
}

.bill-card h3 {
  margin: 0 0 1.5rem;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.item-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.item-col-main {
  display: flex;
  gap: 10px;
  align-items: center;
}

.qty-badge {
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.9rem;
  min-width: 30px;
  text-align: center;
}

.item-name { font-weight: 600; color: var(--text-primary); }
.item-price { font-weight: 600; color: var(--text-secondary); }

.divider-dashed {
  border-top: 2px dashed var(--border-color);
  margin: 1.5rem 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.divider-solid {
  border-top: 1px solid var(--border-color);
  margin: 1rem 0;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
}

.total-amount { color: var(--theme-color, #ff6b6b); }

/* Buttons */
.btn-primary {
  width: 100%;
  padding: 1rem;
  background: var(--theme-color, #ff6b6b);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.btn-primary.requested {
  background: #dcfce7;
  color: #16a34a;
  box-shadow: none;
  cursor: default;
}

.btn-secondary {
  padding: 0.8rem 1.5rem;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

.info-msg {
  text-align: center;
  color: #16a34a;
  font-weight: 600;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.footer {
  text-align: center;
  color: #94a3b8;
  font-size: 0.85rem;
  margin-top: 3rem;
}

.date { margin-top: 5px; opacity: 0.7; }
</style>
