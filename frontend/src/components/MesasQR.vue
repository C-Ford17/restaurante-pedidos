<template>
  <div class="mesas-qr-container">
    <div class="header">
      <div class="title-row">
        <div class="icon-circle">
          <QrCode :size="24" />
        </div>
        <h1>{{ $t('qr_view.title') }}</h1>
      </div>
      <p class="subtitle">{{ $t('qr_view.subtitle') }}</p>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else class="mesas-grid">
      <div v-for="mesa in mesas" :key="mesa.id" class="mesa-card">
        <div class="mesa-header">
          <div class="mesa-badge">
            <span class="label">{{ $t('common.table') }}</span>
            <span class="number">{{ mesa.numero }}</span>
          </div>
          <span class="capacity-tag">
            <Users :size="14" />
            {{ mesa.capacidad }}
          </span>
        </div>
        
        <div class="qr-preview" @click="mostrarQR(mesa)">
          <QrCode :size="48" class="qr-icon-large" />
          <span class="scan-hint">{{ $t('qr_view.view_qr') }}</span>
        </div>
        
        <div class="card-actions">
          <a :href="getUrl(mesa.numero)" target="_blank" class="btn-full-width" title="Abrir enlace">
            <ExternalLink :size="18" />
            {{ $t('qr_view.open_order') }}
          </a>
        </div>
      </div>
    </div>

    <!-- Modal QR -->
    <div v-if="showModal" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="cerrarModal">
          <X :size="24" />
        </button>
        
        <div class="modal-header">
          <div class="modal-badge">{{ $t('common.table') }} {{ selectedMesa?.numero }}</div>
          <h2>{{ $t('qr_view.scan_hint') }}</h2>
        </div>

        <div class="qr-display-wrapper">
          <div class="qr-frame">
            <img v-if="qrImage" :src="qrImage" alt="Código QR" class="qr-image" />
            <div v-else class="spinner"></div>
          </div>
        </div>

        <p class="url-text">{{ getUrl(selectedMesa?.numero) }}</p>

        <div class="modal-footer">
          <button @click="imprimirQR" class="btn-print">
            <Printer :size="20" />
            {{ $t('qr_view.print') }}
          </button>
          <a :href="qrImage" download="qr-mesa.png" class="btn-download" v-if="qrImage">
            <Download :size="20" />
            {{ $t('common.download_qr') }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';
import QRCode from 'qrcode';
import { useI18n } from 'vue-i18n';
import { QrCode, Users, Maximize2, ExternalLink, X, Printer, Download } from 'lucide-vue-next';

const { t } = useI18n();

const mesas = ref([]);
const loading = ref(true);
const showModal = ref(false);
const selectedMesa = ref(null);
const qrImage = ref(null);

const cargarMesas = async () => {
  try {
    const response = await api.getMesas();
    mesas.value = response.data.sort((a, b) => a.numero - b.numero);
  } catch (error) {
    console.error('Error cargando mesas:', error);
  } finally {
    loading.value = false;
  }
};

const getUrl = (numero) => {
  if (!numero) return '';
  return `${window.location.origin}/mesa/${numero}/welcome`;
};

const mostrarQR = async (mesa) => {
  selectedMesa.value = mesa;
  showModal.value = true;
  qrImage.value = null;
  
  try {
    const url = getUrl(mesa.numero);
    qrImage.value = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1e293b',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error(err);
  }
};

const cerrarModal = () => {
  showModal.value = false;
  selectedMesa.value = null;
};

const imprimirQR = () => {
  const win = window.open('', '_blank', 'width=600,height=600');
  win.document.write(`
    <html>
      <head>
        <title>QR Mesa ${selectedMesa.value.numero}</title>
        <style>
          body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; text-align: center; }
          h1 { margin-bottom: 10px; font-size: 24px; color: #333; }
          p { color: #666; margin-bottom: 30px; }
          img { max-width: 300px; border: 1px solid #eee; padding: 10px; border-radius: 8px; }
          .footer { margin-top: 20px; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <h1>Mesa ${selectedMesa.value.numero}</h1>
        <p>Escanea para ver el menú y ordenar</p>
        <img src="${qrImage.value}" />
        <div class="footer">${getUrl(selectedMesa.value.numero)}</div>
        <script>window.onload = () => window.print();<\/script>
      </body>
    </html>
  `);
  win.document.close();
};

onMounted(cargarMesas);
</script>

<style scoped>
.mesas-qr-container {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 40px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.icon-circle {
  width: 48px;
  height: 48px;
  background: var(--card-bg);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.header h1 {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin-left: 64px;
}

.mesas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.mesa-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.mesa-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  border-color: rgba(99, 102, 241, 0.1);
}

.mesa-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.mesa-badge {
  display: flex;
  flex-direction: column;
}

.mesa-badge .label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
  font-weight: 600;
}

.mesa-badge .number {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}

.capacity-tag {
  background: var(--bg-secondary);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.qr-preview {
  background: var(--bg-secondary);
  border-radius: 16px;
  height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
  cursor: pointer;
  transition: background 0.2s;
}

.qr-preview:hover {
  background: var(--border-color);
}

.qr-icon-large {
  color: var(--text-secondary);
  transition: color 0.2s;
}

.qr-preview:hover .qr-icon-large {
  color: var(--primary-color);
}

.scan-hint {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.btn-full-width {
  width: 100%;
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  font-weight: 600;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
}

.btn-full-width:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(79, 70, 229, 0.3);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal-content {
  background: var(--card-bg);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 480px;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: modalUp 0.3s ease-out;
}

@keyframes modalUp {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: var(--bg-secondary);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #ef4444;
}

.modal-header {
  text-align: center;
  margin-bottom: 32px;
}

.modal-badge {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 12px;
  text-transform: uppercase;
}

.modal-header h2 {
  font-size: 1.8rem;
  margin: 0;
  color: var(--text-primary);
}

.qr-display-wrapper {
  background: white; /* Conserve white for QR contrast */
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); /* Outer shadow */
  border: 1px solid var(--border-color);
  margin-bottom: 24px;
}

.qr-image {
  width: 250px;
  height: 250px;
  display: block;
}

.url-text {
  font-family: monospace;
  background: var(--bg-secondary);
  padding: 8px 16px;
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 32px;
  word-break: break-all;
  text-align: center;
}

.modal-footer {
  display: flex;
  gap: 16px;
  width: 100%;
}

.btn-print, .btn-download {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  font-size: 1rem;
}

.btn-print {
  background: var(--text-primary);
  color: var(--card-bg);
  border: none;
}

.btn-print:hover {
  background: var(--text-secondary);
}

.btn-download {
  background: var(--card-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-download:hover {
  background: var(--bg-secondary);
  border-color: var(--text-secondary);
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 100px 0;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Mobile */
@media (max-width: 640px) {
  .mesas-qr-container { padding: 20px; }
  .modal-content { padding: 24px; }
  .qr-image { width: 200px; height: 200px; }
  .title-row h1 { font-size: 1.5rem; }
  .subtitle { margin-left: 0; font-size: 1rem; }
}
</style>
