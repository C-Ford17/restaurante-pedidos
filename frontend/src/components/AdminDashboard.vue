<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <div class="header-title">
        <BarChart3 :size="28" class="header-icon" />
        <h2>{{ $t('admin.title') }}</h2>
      </div>
      <button @click="cargarReportes" class="btn-refresh" :disabled="loading">
        <RefreshCw :size="18" :class="{ 'spinning': loading }" />
        {{ $t('cashier.update') }}
      </button>
    </div>

    <div class="dashboard-content">
      <div v-if="loading" class="loading">{{ $t('admin.loading_reports') }}</div>

      <template v-else>
        <!-- Estadísticas Diarias -->
        <div class="section">
          <h3 class="section-title">
            <TrendingUp :size="20" />
            {{ $t('admin.daily_stats') }}
          </h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon sales">
                <DollarSign :size="24" />
              </div>
              <div class="stat-content">
                <div class="stat-value">${{ ventasTotal }}</div>
                <div class="stat-label">{{ $t('admin.total_sales') }}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon orders">
                <ShoppingBag :size="24" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ pedidosHoy.length }}</div>
                <div class="stat-label">{{ $t('admin.orders') }}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon paid">
                <CheckCircle2 :size="24" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ pedidosPagados.length }}</div>
                <div class="stat-label">{{ $t('admin.paid') }}</div>
              </div>
            </div>
            <div class="stat-card clickable" @click="mostrarDetallePropinas = true">
              <div class="stat-icon tips">
                <Coins :size="24" />
              </div>
              <div class="stat-content">
                <div class="stat-value">${{ formatCurrency(propinasHoy.total_propinas) }}</div>
                <div class="stat-label">Propinas Hoy</div>
                <div class="stat-detail">
                  {{ propinasHoy.total_pedidos_con_propina }} pedidos
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- BARRA DE FILTROS -->
        <div class="section filters-section">
          <h3 class="section-title">
            <Calendar :size="20" />
            {{ $t('admin.report_filters') }}
          </h3>
          <div class="filters-row">
            <div class="filter-group">
              <label>{{ $t('admin.from') }}:</label>
              <input type="date" v-model="filtroFechaInicio" class="input-date" />
            </div>
            <div class="filter-group">
              <label>{{ $t('admin.to') }}:</label>
              <input type="date" v-model="filtroFechaFin" class="input-date" />
            </div>
            <button @click="aplicarFiltros" class="btn btn-primary">
              <Filter :size="16" />
              {{ $t('admin.apply_filters') }}
            </button>
            <button @click="limpiarFiltros" class="btn btn-secondary">
              <X :size="16" />
              {{ $t('admin.clear') }}
            </button>
          </div>
        </div>

        <!-- Desglose por Método de Pago -->
        <div class="section">
          <h3 class="section-title">
            <CreditCard :size="20" />
            {{ $t('admin.payment_methods') }}
          </h3>
          <div class="metodos-grid">
            <div v-for="metodo in detallesVentas" :key="metodo.metodo_pago" class="metodo-card clickable" @click="filtrarPorMetodo(metodo.metodo_pago)" style="cursor: pointer;">
              <div class="metodo-header">
                <span class="metodo-nombre">{{ $te('cashier.methods.' + metodo.metodo_pago) ? $t('cashier.methods.' + metodo.metodo_pago) : metodo.metodo_pago.toUpperCase() }}</span>
                <span class="metodo-cantidad">{{ metodo.cantidad }} {{ $t('admin.transactions') }}</span>
              </div>
              <div class="metodo-total">${{ Number(metodo.total).toFixed(2) }}</div>
            </div>
          </div>
        </div>


        <!-- Reporte Histórico -->
        <div class="section">
          <h3 class="section-title">
            <BarChart3 :size="20" />
            {{ $t('admin.historical_report') }}
          </h3>
          
          <!-- Total Acumulado -->
          <div class="total-acumulado">
            <div class="total-card">
              <div class="total-label">{{ $t('admin.total_accumulated') }}</div>
              <div class="total-value">${{ Number(totalAcumulado.total_acumulado).toFixed(2) || '0.00' }}</div>
              <div class="total-subtitle">{{ totalAcumulado.total_transacciones || 0 }} {{ $t('admin.transactions') }}</div>
            </div>
          </div>
          
          <!-- Tabla de Ventas por Día -->
          <div v-if="ventasPorDia.length === 0" class="empty-state">
            {{ $t('admin.no_history') }}
          </div>
          <div v-else class="tabla-historico">
            <table>
              <thead>
                <tr>
                  <th>{{ $t('editor.tables.date') || 'Fecha' }}</th>
                  <th>{{ $t('admin.transactions') }}</th>
                  <th>{{ $t('waiter.total') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="dia in ventasPorDia" :key="dia.fecha">
                  <td>{{ formatearFecha(dia.fecha) }}</td>
                  <td>{{ dia.cantidad_transacciones }}</td>
                  <td class="total-dia">${{ Number(dia.total_dia).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Detalle de Pedidos -->
        <div class="section">
          <h3 class="section-title">
            <FileText :size="20" />
            {{ $t('admin.daily_orders') }}
          </h3>
          
          <!-- Filtros de tabla -->
          <div class="table-filters" v-if="pedidosHoy.length > 0">
            <div class="filter-group">
              <label>Mesero:</label>
              <select v-model="filtroMesero" class="filter-select">
                <option value="">Todos</option>
                <option v-for="mesero in meserosUnicos" :key="mesero" :value="mesero">{{ mesero }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Estado:</label>
              <select v-model="filtroEstado" class="filter-select">
                <option value="">Todos</option>
                <option v-for="estado in estadosUnicos" :key="estado" :value="estado">
                  {{ $t('status.' + estado) || estado.toUpperCase() }}
                </option>
              </select>
            </div>
            <button v-if="filtroMesero || filtroEstado" @click="limpiarFiltrosTabla" class="btn btn-sm btn-secondary">Limpiar filtros</button>
          </div>

          <div v-if="pedidosHoy.length === 0" class="empty-state">
            {{ $t('admin.no_orders_today') }}
          </div>
          <div v-else-if="pedidosFiltrados.length === 0" class="empty-state">
            No hay pedidos que coincidan con los filtros
          </div>
          <div v-else class="tabla-pedidos">
            <table>
              <thead>
                <tr>
                  <th>{{ $t('admin.hour') }}</th>
                  <th>{{ $t('waiter.table') }}</th>
                  <th>{{ $t('common.waiter') || 'Mesero' }}</th>
                  <th>Items</th>
                  <th>{{ $t('waiter.total') }}</th>
                  <th>{{ $t('common.status') || 'Estado' }}</th>
                  <th>{{ $t('common.actions') || 'Acciones' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pedido in pedidosFiltrados" :key="pedido.id">
                  <td>{{ formatearHora(pedido.created_at) }}</td>
                  <td>{{ pedido.mesa_numero }}</td>
                  <td>{{ pedido.mesero }}</td>
                  <td>{{ pedido.items_count }}</td>
                  <td>${{ pedido.total }}</td>
                  <td>
                    <span :class="['estado-badge', `estado-${pedido.estado}`]">
                      {{ $t('status.' + pedido.estado) || pedido.estado.toUpperCase() }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button @click="verDetallesPedido(pedido.id)" class="btn btn-sm btn-view" title="Ver detalles">
                        <Eye :size="14" />
                        {{ $t('cashier.view') }}
                      </button>
                      <button @click="eliminarPedido(pedido.id)" class="btn btn-sm btn-delete" title="Eliminar pedido">
                        <Trash2 :size="14" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tiempos de Cocina -->
        <div class="section">
          <h3 class="section-title">
            <Clock :size="20" />
            {{ $t('admin.kitchen_times') }}
          </h3>
          
          <div v-if="loadingTiempos" class="loading-small">{{ $t('common.loading') }}</div>
          
          <div v-else-if="tiemposCocina.length > 0" class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>{{ $t('editor.form.category') }}</th>
                  <th>{{ $t('admin.preparations') }}</th>
                  <th>{{ $t('admin.average') }}</th>
                  <th>{{ $t('admin.estimated') }}</th>
                  <th>{{ $t('admin.difference') }}</th>
                  <th>Min/Max</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="stat in tiemposCocina" :key="stat.menu_item_id">
                  <td><strong>{{ stat.item_nombre }}</strong></td>
                  <td><span class="categoria-badge">{{ stat.categoria }}</span></td>
                  <td class="text-center">{{ stat.total_preparaciones }}</td>
                  <td class="text-center"><strong>{{ Math.round(stat.tiempo_promedio) }} min</strong></td>
                  <td class="text-center">{{ stat.tiempo_estimado || '-' }} min</td>
                  <td class="text-center">
                    <span :class="getDiferenciaClass(stat.diferencia_minutos)">
                      {{ stat.diferencia_minutos > 0 ? '+' : '' }}{{ Math.round(stat.diferencia_minutos) }} min
                    </span>
                  </td>
                  <td class="text-center text-small">
                    {{ stat.tiempo_minimo }}/{{ stat.tiempo_maximo }} min
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div v-else class="empty-state">
            {{ $t('admin.no_stats') }}
          </div>
        </div>

        <!-- Top Platos Más Pedidos -->
        <div class="section">
          <h3 class="section-title">
            <Trophy :size="20" />
            {{ $t('admin.top_dishes') }}
          </h3>
          
          <div v-if="loadingTopPlatos" class="loading-small">{{ $t('common.loading') }}</div>
          
          <div v-else-if="topPlatos && topPlatos.length > 0" class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{{ $t('admin.dish') }}</th>
                  <th>{{ $t('editor.form.category') }}</th>
                  <th>{{ $t('admin.total_orders') }}</th>
                  <th>{{ $t('admin.total_income') }}</th>
                  <th>{{ $t('admin.unit_price') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(plato, index) in topPlatos" :key="plato.id">
                  <td class="text-center"><strong>{{ index + 1 }}</strong></td>
                  <td><strong>{{ plato.nombre }}</strong></td>
                  <td><span class="categoria-badge">{{ plato.categoria }}</span></td>
                  <td class="text-center"><strong>{{ plato.total_pedidos || 0 }}</strong></td>
                  <td class="text-center">${{ Number(plato.ingresos_totales || 0).toFixed(2) }}</td>
                  <td class="text-center">${{ Number(plato.precio || 0).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div v-else class="empty-state">
            {{ $t('admin.no_stats') }}
          </div>
        </div>
      </template>
    </div>

    <!-- Modal de Detalles del Pedido -->
    <div v-if="pedidoDetalle" class="modal-overlay" @click.self="cerrarDetalle">
      <div class="modal-detalle">
        <div class="modal-header">
          <h3>
            <FileText :size="20" style="display: inline-block; vertical-align: middle; margin-right: 8px;" />
            {{ $t('admin.order_details') }}
          </h3>
          <button @click="cerrarDetalle" class="btn-cerrar">✕</button>
        </div>
        <div class="modal-body">
          <div class="detalle-info">
            <div class="info-row">
              <span>{{ $t('waiter.table') }}:</span>
              <strong>{{ pedidoDetalle.mesa_numero }}</strong>
            </div>
            <div class="info-row">
              <span>{{ $t('common.status') }}:</span>
              <span :class="['estado-badge', `estado-${pedidoDetalle.estado}`]">
                {{ $t('status.' + pedidoDetalle.estado) || pedidoDetalle.estado.toUpperCase() }}
              </span>
            </div>
            <div class="info-row">
              <span>{{ $t('admin.hour') }}:</span>
              <strong>{{ formatearHora(pedidoDetalle.created_at) }}</strong>
            </div>
            
            <div class="info-row" v-if="pedidoDetalle.pagos && pedidoDetalle.pagos.length > 0">
              <div style="width: 100%;">
                <span><strong>{{ $t('admin.transactions') }}:</strong></span>
                <ul style="list-style: none; padding: 0; margin-top: 5px;">
                  <li v-for="(pago, pIndex) in pedidoDetalle.pagos" :key="pIndex" style="font-size: 0.9em; margin-bottom: 4px; display: flex; justify-content: space-between;">
                    <span>
                      {{ formatearHora(pago.created_at) }} - 
                      {{ $te('cashier.methods.' + pago.metodo_pago) ? $t('cashier.methods.' + pago.metodo_pago) : pago.metodo_pago.toUpperCase() }}
                    </span>
                    <strong>${{ Number(pago.monto).toLocaleString() }}</strong>
                  </li>
                </ul>
              </div>
           </div>
          </div>

          <div class="detalle-items">
            <h4>{{ $t('waiter.order_items') }}</h4>
            <div class="items-tabla">
              <div class="item-row header-row">
                <span>Cant.</span>
                <span>Descripción</span>
                <span>Precio</span>
                <span>Total</span>
              </div>
              <div v-for="(item, index) in itemsAgrupados" :key="index" class="item-row">
                <span>{{ item.cantidad }}</span>
                <span>{{ item.nombre }}</span>
                <span>${{ Number(item.precio_unitario).toFixed(2) }}</span>
                <span>${{ Number(item.total).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div class="detalle-total">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.9em;">
              <span>{{ $t('ticket.tip') }}:</span>
              <span>${{ Number(pedidoDetalle.propina_monto || 0).toLocaleString() }}</span>
            </div>
            <span>{{ $t('waiter.total').toUpperCase() }}</span>
            <strong>${{ pedidoDetalle.total }}</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Desglose de Propinas -->
    <div v-if="mostrarDetallePropinas" class="modal-overlay" @click.self="mostrarDetallePropinas = false">
      <div class="modal-detalle">
        <div class="modal-header">
          <h3>
            <Coins :size="20" style="display: inline-block; vertical-align: middle; margin-right: 8px;" />
            Reporte de Propinas
          </h3>
          <button @click="mostrarDetallePropinas = false" class="btn-cerrar">✕</button>
        </div>
        <div class="modal-body">
          <div class="detalle-info">
            <div class="info-row">
              <span>Total del Día:</span>
              <strong style="color: #2ecc71; font-size: 1.3em;">${{ formatCurrency(propinasHoy.total_propinas) }}</strong>
            </div>
            <div class="info-row">
              <span>Promedio por Pedido:</span>
              <strong>${{ formatCurrency(propinasHoy.promedio_propina) }}</strong>
            </div>
            <div class="info-row">
              <span>Pedidos con Propina:</span>
              <strong>{{ propinasHoy.total_pedidos_con_propina }}</strong>
            </div>
          </div>

          <div class="detalle-items" style="margin-top: 20px;">
            <h4>Desglose por Mesero</h4>
            <div v-if="propinasHoy.desglose_meseros && propinasHoy.desglose_meseros.length > 0" class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Mesero</th>
                    <th>Pedidos</th>
                    <th>Total Propinas</th>
                    <th>Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="mesero in propinasHoy.desglose_meseros" :key="mesero.mesero_id">
                    <td><strong>{{ mesero.mesero }}</strong></td>
                    <td class="text-center">{{ mesero.pedidos }}</td>
                    <td class="text-center"><strong>${{ formatCurrency(mesero.total_propinas) }}</strong></td>
                    <td class="text-center">${{ formatCurrency(mesero.promedio_propina) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-state">
              No hay propinas registradas para el período seleccionado
        </div>
      </div>
    </div>
      </div>
    </div>
  </div>

    <!-- Modal de Pedidos por Método de Pago -->
    <div v-if="modalMetodoPago" class="modal-overlay" @click.self="cerrarModalMetodo">
      <div class="modal-detalle">
        <div class="modal-header">
          <h3>
            <CreditCard :size="20" style="display: inline-block; vertical-align: middle; margin-right: 8px;" />
            Pedidos - {{ $te('cashier.methods.' + modalMetodoPago.metodo) ? $t('cashier.methods.' + modalMetodoPago.metodo) : modalMetodoPago.metodo.toUpperCase() }}
          </h3>
          <button @click="cerrarModalMetodo" class="btn-cerrar">✕</button>
        </div>
        <div class="modal-body">
          <div class="detalle-info">
            <div class="info-row">
              <span>Total:</span>
              <strong style="color: #2ecc71; font-size: 1.3em;">${{ Number(modalMetodoPago.total).toFixed(2) }}</strong>
            </div>
            <div class="info-row">
              <span>Transacciones:</span>
              <strong>{{ modalMetodoPago.cantidad }}</strong>
            </div>
          </div>

          <div class="detalle-items" style="margin-top: 20px;">
            <h4>Pedidos ({{ modalMetodoPago.pedidos.length }})</h4>
            <div v-if="modalMetodoPago.pedidos.length > 0" class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Mesa</th>
                    <th>Mesero</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="pedido in modalMetodoPago.pedidos" :key="pedido.id">
                    <td>{{ formatearHora(pedido.created_at) }}</td>
                    <td class="text-center">{{ pedido.mesa_numero }}</td>
                    <td>{{ pedido.mesero }}</td>
                    <td class="text-center"><strong>${{ pedido.total }}</strong></td>
                    <td>
                      <span :class="['estado-badge', `estado-${pedido.estado}`]">
                        {{ $t('status.' + pedido.estado) || pedido.estado.toUpperCase() }}
                      </span>
                    </td>
                    <td>
                      <button @click="verDetallesPedidoDesdeModal(pedido.id)" class="btn btn-sm btn-info">
                        {{ $t('cashier.view') }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-state">
              No hay pedidos con este método de pago
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import api from '../api';
import socket from '../socket';
import GeneradorQR from './GeneradorQR.vue';
import { useI18n } from 'vue-i18n';
import { 
  BarChart3, RefreshCw, TrendingUp, DollarSign, ShoppingBag, 
  CheckCircle2, Coins, Calendar, CreditCard, Smartphone,
  FileText, Clock, Trophy, Filter, X, Eye, Trash2
} from 'lucide-vue-next';

const { t } = useI18n();

const mostrarGeneradorQR = ref(false);
const loading = ref(false);
const detallesVentas = ref([]);
const pedidosHoy = ref([]);
const ventasPorDia = ref([]);
const totalAcumulado = ref({ total_transacciones: 0, total_acumulado: 0 });
const pedidoDetalle = ref(null);

// Tiempos de Cocina
const tiemposCocina = ref([]);
const loadingTiempos = ref(false);
const filtroFechaInicio = ref('');
const filtroFechaFin = ref('');

// Top Platos
const topPlatos = ref([]);
const loadingTopPlatos = ref(false);

// Propinas
const propinasHoy = ref({
  total_propinas: 0,
  promedio_propina: 0,
  total_pedidos_con_propina: 0,
  desglose_meseros: []
});
const mostrarDetallePropinas = ref(false);

// Filtros de tabla de pedidos
const filtroMesero = ref('');
const filtroEstado = ref('');

// Modal de método de pago
const modalMetodoPago = ref(null);

const ventasTotal = computed(() => {
  return detallesVentas.value
    .reduce((sum, m) => sum + (Number(m.total) || 0), 0)
    .toFixed(2);
});

const pedidosPagados = computed(() => {
  return pedidosHoy.value.filter(p => p.estado === 'pagado');
});

// Agrupar items por nombre para mostrar cantidades consolidadas
const itemsAgrupados = computed(() => {
  if (!pedidoDetalle.value || !pedidoDetalle.value.items) return [];
  
  const grupos = {};
  
  pedidoDetalle.value.items.forEach(item => {
    const key = `${item.menu_item_id || item.nombre}`;
    
    if (!grupos[key]) {
      grupos[key] = {
        nombre: item.nombre,
        precio_unitario: item.precio_unitario || item.precio || 0,
        cantidad: 0,
        total: 0
      };
    }
    
    grupos[key].cantidad += item.cantidad;
    grupos[key].total += (item.precio_unitario || item.precio || 0) * item.cantidad;
  });
  
  return Object.values(grupos);
});

// Filtros de tabla
const pedidosFiltrados = computed(() => {
  let result = pedidosHoy.value;
  
  if (filtroMesero.value) {
    result = result.filter(p => p.mesero === filtroMesero.value);
  }
  
  if (filtroEstado.value) {
    result = result.filter(p => p.estado === filtroEstado.value);
  }
  
  return result;
});

const meserosUnicos = computed(() => {
  const meseros = [...new Set(pedidosHoy.value.map(p => p.mesero).filter(Boolean))];
  return meseros.sort();
});

const estadosUnicos = computed(() => {
  const estados = [...new Set(pedidosHoy.value.map(p => p.estado).filter(Boolean))];
  return estados.sort();
});

const limpiarFiltros = () => {
    filtroFechaInicio.value = '';
    filtroFechaFin.value = '';
    aplicarFiltros();
};

const limpiarFiltrosTabla = () => {
  filtroMesero.value = '';
  filtroEstado.value = '';
};

const filtrarPorMetodo = (metodoPago) => {
  // Filtrar pedidos que tengan al menos un pago con este método
  const pedidosFiltrados = pedidosHoy.value.filter(pedido => {
    // Si el pedido tiene pagos, verificar si alguno coincide con el método
    if (pedido.pagos && pedido.pagos.length > 0) {
      return pedido.pagos.some(pago => pago.metodo_pago === metodoPago);
    }
    return false;
  });
  
  const metodoInfo = detallesVentas.value.find(m => m.metodo_pago === metodoPago);
  
  modalMetodoPago.value = {
    metodo: metodoPago,
    metodoNombre: metodoPago,
    pedidos: pedidosFiltrados,
    total: metodoInfo?.total || 0,
    cantidad: metodoInfo?.cantidad || 0
  };
};

const cerrarModalMetodo = () => {
  modalMetodoPago.value = null;
};

const cargarReportes = async () => {
  loading.value = true;
  try {
    const params = {};
    if (filtroFechaInicio.value) params.fecha_inicio = filtroFechaInicio.value;
    if (filtroFechaFin.value) params.fecha_fin = filtroFechaFin.value;

    const [ventasRes, pedidosRes, historicoRes] = await Promise.all([
      api.getVentasHoy(params),
      api.getPedidosHoy(params),
      api.getReporteHistorico()
    ]);
    detallesVentas.value = ventasRes.data.detalles || [];
    pedidosHoy.value = pedidosRes.data || [];
    ventasPorDia.value = historicoRes.data.ventas_por_dia || [];
    totalAcumulado.value = historicoRes.data.total_acumulado || { total_transacciones: 0, total_acumulado: 0 };
    console.log('📊 Pedidos:', pedidosHoy.value.length);
    if (pedidosHoy.value[0]) console.log('Primer pedido:', pedidosHoy.value[0]);
  } catch (err) {
    console.error('Error cargando reportes:', err);
  } finally {
    loading.value = false;
  }
};

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString(t('common.locale_code') || 'es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatearHora = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString(t('common.locale_code') || 'es-CO', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const verDetallesPedido = async (pedidoId) => {
  try {
    const response = await api.getPedido(pedidoId);
    pedidoDetalle.value = response.data;
  } catch (err) {
    console.error('Error cargando detalles:', err);
    alert('❌ ' + t('common.error'));
  }
};

// Función para ver detalles desde el modal de método de pago
const verDetallesPedidoDesdeModal = async (pedidoId) => {
  // Primero cerrar el modal de método de pago
  cerrarModalMetodo();
  // Luego abrir el modal de detalles del pedido
  await verDetallesPedido(pedidoId);
};

const eliminarPedido = async (id) => {
  if (!confirm('⚠️ ¿Estás SEGURO de eliminar este pedido?\n\nEsta acción eliminará el pedido, sus items y su historial de pagos.\nNO se puede deshacer.')) return;
  
  if (!confirm('¿De verdad? Confirma nuevamente para eliminar permanentemente.')) return;

  try {
    loading.value = true;
    await api.deletePedido(id);
    await cargarReportes();
    alert('✅ Pedido eliminado correctamente');
  } catch (err) {
    console.error('Error eliminando pedido:', err);
    alert('❌ Error al eliminar pedido');
  } finally {
    loading.value = false;
  }
};

const cerrarDetalle = () => {
  pedidoDetalle.value = null;
};

// Cargar tiempos de cocina
const cargarTiemposCocina = async () => {
  loadingTiempos.value = true;
  try {
    const params = {};
    if (filtroFechaInicio.value) params.fecha_inicio = filtroFechaInicio.value;
    if (filtroFechaFin.value) params.fecha_fin = filtroFechaFin.value;
    
    const response = await api.getTiemposCocina(params);
    tiemposCocina.value = response.data;
  } catch (err) {
    console.error('Error cargando tiempos de cocina:', err);
  } finally {
    loadingTiempos.value = false;
  }
};

// Helper para clase de diferencia
const getDiferenciaClass = (diferencia) => {
  if (!diferencia) return '';
  if (diferencia > 5) return 'diferencia-alta';
  if (diferencia < -3) return 'diferencia-baja';
  return 'diferencia-normal';
};

// Cargar top platos
const cargarTopPlatos = async () => {
  loadingTopPlatos.value = true;
  try {
    const params = {};
    if (filtroFechaInicio.value) params.fecha_inicio = filtroFechaInicio.value;
    if (filtroFechaFin.value) params.fecha_fin = filtroFechaFin.value;

    const response = await api.getTopPlatos(10, params);
    topPlatos.value = response.data;
  } catch (err) {
    console.error('Error cargando top platos:', err);
  } finally {
    loadingTopPlatos.value = false;
  }
};

// Cargar propinas del día
const cargarPropinaDelDia = async () => {
  try {
    const params = {};
    if (filtroFechaInicio.value) params.fecha_inicio = filtroFechaInicio.value;
    if (filtroFechaFin.value) params.fecha_fin = filtroFechaFin.value;
    
    const res = await api.getPropinaHoy(params);
    propinasHoy.value = res.data;
  } catch (err) {
    console.error('Error cargando propinas:', err);
  }
};

// Helper para formatear moneda
const formatCurrency = (amount) => {
  return Number(amount || 0).toLocaleString('es-CO', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  });
};

const aplicarFiltros = () => {
    cargarReportes();
    cargarTiemposCocina();
    cargarTopPlatos();
    cargarPropinaDelDia();
};

// ================= REAL-TIME =================
const setupRealTime = () => {
    if (!socket.connected) socket.connect();

    socket.on('nuevo_pedido', (nuevoPedido) => {
        pedidosHoy.value.unshift({
            ...nuevoPedido,
            mesero: '...'
        });
    });

    socket.on('pedido_actualizado', ({ id, estado }) => {
        const pedido = pedidosHoy.value.find(p => p.id === id);
        if (pedido) {
            pedido.estado = estado;
        }
    });

    socket.on('pedido_pagado', ({ pedido_id, estado, monto, metodo_pago }) => {
        const pedido = pedidosHoy.value.find(p => p.id === pedido_id);
        if (pedido) {
            pedido.estado = estado;
        }

        const metodoExistente = detallesVentas.value.find(d => d.metodo_pago === metodo_pago);
        if (metodoExistente) {
            metodoExistente.cantidad = Number(metodoExistente.cantidad) + 1;
            metodoExistente.total = Number(metodoExistente.total) + Number(monto);
        } else {
            detallesVentas.value.push({
                metodo_pago,
                cantidad: 1,
                total: Number(monto)
            });
        }

        totalAcumulado.value.total_transacciones = Number(totalAcumulado.value.total_transacciones) + 1;
        totalAcumulado.value.total_acumulado = Number(totalAcumulado.value.total_acumulado) + Number(monto);
    });
};

onMounted(() => {
  cargarReportes();
  cargarTiemposCocina();
  cargarTopPlatos();
  cargarPropinaDelDia();
  setupRealTime();
});

onUnmounted(() => {
    socket.off('nuevo_pedido');
    socket.off('pedido_actualizado');
    socket.off('pedido_pagado');
});
</script>

<style src="../assets/styles/AdminDashboard.css" scoped></style>
