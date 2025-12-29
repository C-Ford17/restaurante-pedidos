<template>
  <div class="mesas-qr-container">
    <div class="header">
      <h1>📱 {{ $t('qr_view.title') }}</h1>
      <p>{{ $t('qr_view.subtitle') }}</p>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else class="mesas-grid">
      <div v-for="mesa in mesas" :key="mesa.id" class="mesa-card">
        <div class="mesa-icon">🍽️</div>
        <h2>{{ $t('common.table') }} {{ mesa.numero }}</h2>
        <p class="capacidad">{{ $t('qr_view.capacity').replace('{n}', mesa.capacidad) }}</p>
        
        <div class="qr-actions">
          <button @click="mostrarQR(mesa)" class="btn-qr">
            📱 {{ $t('qr_view.view_qr') }}
          </button>
          <a :href="`/mesa/${mesa.numero}/welcome`" target="_blank" class="btn-link">
            🔗 {{ $t('qr_view.open_order') }}
          </a>
        </div>
        
        <div class="qr-url">
          {{ getUrl(mesa.numero) }}
        </div>
      </div>
    </div>

    <!-- Modal QR -->
    <div v-if="showModal" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="cerrarModal">&times;</button>
        
        <div class="modal-header">
          <h2>{{ $t('common.table') }} {{ selectedMesa?.numero }}</h2>
          <p>{{ $t('qr_view.scan_hint') }}</p>
        </div>

        <div class="qr-display">
          <img v-if="qrImage" :src="qrImage" alt="Código QR" class="qr-image" />
          <div v-else class="spinner"></div>
        </div>

        <div class="modal-footer">
          <p class="url-text">{{ getUrl(selectedMesa?.numero) }}</p>
          <button @click="imprimirQR" class="btn-print">🖨️ {{ $t('qr_view.print') }}</button>
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

const { t } = useI18n();

const mesas = ref([]);
const loading = ref(true);
const showModal = ref(false);
const selectedMesa = ref(null);
const qrImage = ref(null);

const cargarMesas = async () => {
  try {
    const response = await api.getMesas();
    // Ordenar por número de mesa
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
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Error generando QR:', err);
  }
};

const cerrarModal = () => {
  showModal.value = false;
  selectedMesa.value = null;
  qrImage.value = null;
};

const imprimirQR = () => {
  const printWindow = window.open('', '_blank');
  
  // Prepare translations
  const title = `${t('common.table')} ${selectedMesa.value.numero}`;
  const subtitle = t('qr_view.scan_hint');
  
  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: sans-serif; text-align: center; padding: 20px; }
          .qr-container { border: 2px solid #000; padding: 20px; display: inline-block; border-radius: 10px; }
          h1 { margin: 0 0 10px 0; font-size: 24px; }
          img { width: 300px; height: 300px; }
          p { margin: 10px 0 0 0; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <h1>${title}</h1>
          <img src="${qrImage.value}" />
          <p>${subtitle}</p>
        </div>
        <script>
          window.onload = function() { window.print(); window.close(); }
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

onMounted(() => {
  cargarMesas();
});
</script>

<style scoped>
.mesas-qr-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Inter', sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  color: #111827;
  margin-bottom: 8px;
}

.header p {
  color: #6b7280;
}

.mesas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
}

.mesa-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  border: 1px solid #e5e7eb;
}

.mesa-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.mesa-icon {
  font-size: 40px;
  margin-bottom: 16px;
}

.mesa-card h2 {
  font-size: 20px;
  color: #111827;
  margin-bottom: 4px;
}

.capacidad {
  color: #9ca3af;
  font-size: 14px;
  margin-bottom: 20px;
}

.qr-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 12px;
}

.btn-link, .btn-qr {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: background 0.2s;
}

.btn-link {
  background: #e0e7ff;
  color: #4338ca;
}

.btn-link:hover {
  background: #c7d2fe;
}

.btn-qr {
  background: #4f46e5;
  color: white;
}

.btn-qr:hover {
  background: #4338ca;
}

.qr-url {
  font-size: 12px;
  color: #6b7280;
  word-break: break-all;
  background: #f3f4f6;
  padding: 8px;
  border-radius: 6px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
}

.modal-header h2 {
  margin: 0 0 5px 0;
  color: #111827;
}

.modal-header p {
  color: #6b7280;
  margin: 0 0 20px 0;
}

.qr-display {
  background: #f9fafb;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  min-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.qr-image {
  width: 100%;
  max-width: 250px;
  height: auto;
}

.url-text {
  font-size: 12px;
  color: #6b7280;
  word-break: break-all;
  margin-bottom: 15px;
  background: #f3f4f6;
  padding: 8px;
  border-radius: 6px;
}

.btn-print {
  background: #10b981;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-print:hover {
  background: #059669;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.close-btn:hover {
  color: #ef4444;
}
</style>
