<template>
  <div id="app" class="app-container">
    <!-- Vista Pública del Menú -->
    <MenuView v-if="isPublicMenu" />

    <!-- Vista Pública de los Códigos QR -->
    <MesasQR v-else-if="isPublicMesasQR" />

    <!-- Vista Pública del Estado del Pedido -->
    <PedidoStatus v-else-if="isPublicPedidoStatus" />

    <!-- ✅ Vista Pública de la Cuenta -->
    <CuentaView v-else-if="isPublicCuenta" />
    
    <!-- ✅ Flujo de Cliente (Router) -->
    <router-view v-else-if="isCustomerFlow" />

    <!-- Aplicación Principal -->
    <template v-else>
      <!-- Si no hay usuario logueado, mostrar login -->
      <LoginForm v-if="!usuarioStore.usuario" />

      <!-- Si hay usuario logueado, mostrar según rol -->
      <template v-else>
        <!-- Navbar superior -->
        <nav class="navbar">
          <div class="navbar-content">
            <div class="navbar-left">
              <div class="brand">
                <div class="brand-icon">
                  <img :src="logoUrl" alt="Logo" />
                </div>
                <h1 class="logo">{{ nombreRestaurante }}</h1>
              </div>
              
              <div class="status-pill" :class="{ 'connected': isConnected, 'disconnected': !isConnected }" :title="isConnected ? 'Conectado' : 'Desconectado'">
                 <Wifi :size="14" v-if="isConnected" />
                 <WifiOff :size="14" v-else />
                 <span class="status-text">{{ isConnected ? 'Online' : 'Offline' }}</span>
              </div>
            </div>

            <div class="navbar-right">
              <span class="rol-badge" :class="`rol-${usuarioStore.usuario.rol}`">
                {{ obtenerNombreRol(usuarioStore.usuario.rol) }}
              </span>
              <div class="divider"></div>
              <LanguageSwitcher />
              <div class="user-profile">
                <div class="avatar-circle">
                  {{ usuarioStore.usuario.nombre.charAt(0).toUpperCase() }}
                </div>
                <span class="usuario-nombre">{{ usuarioStore.usuario.nombre }}</span>
              </div>
              <button @click="logout" class="btn-logout-icon" title="Cerrar Sesión">
                <LogOut :size="18" />
              </button>
            </div>
          </div>
        </nav>

        <!-- Contenido según rol -->
        <div class="main-content">
          <MeseroPanel v-if="usuarioStore.usuario.rol === 'mesero'" />
          <CocineroPanel v-if="usuarioStore.usuario.rol === 'cocinero'" />
          <CajaPanel v-if="usuarioStore.usuario.rol === 'facturero' || usuarioStore.usuario.rol === 'cajero'" />
          <AdminPanel v-if="usuarioStore.usuario.rol === 'admin'" />
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { usePedidoStore } from './stores/pedidoStore';
import { useUsuarioStore } from './stores/usuarioStore';
import LoginForm from './components/LoginForm.vue';
import MeseroPanel from './components/MeseroPanel.vue';
import CocineroPanel from './components/CocineroPanel.vue';
import CajaPanel from './components/CajaPanel.vue';
import AdminPanel from './components/AdminPanel.vue';
import MesasQR from './components/MesasQR.vue';
import MenuView from './components/MenuView.vue';
import PedidoStatus from './components/PedidoStatus.vue';
import CuentaView from './views/CuentaView.vue';
import { UtensilsCrossed, LogOut, Wifi, WifiOff } from 'lucide-vue-next';

import socket from './socket';
import api from './api'; 
import LanguageSwitcher from './components/LanguageSwitcher.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const title = import.meta.env.VITE_APP_TITLE;

// ✅ NUEVO: Nombre dinámico del restaurante
// ✅ NUEVO: Nombre dinámico del restaurante
const nombreRestaurante = ref(import.meta.env.VITE_APP_TITLE || 'Restaurante Demo');
const logoUrl = ref('/android/android-launchericon-192-192.png'); // Default logo

const cargarConfiguracion = async () => {
  try {
    const res = await api.getConfig();
    if (res.data) {
      // 1. Nombre
      if (res.data.nombre) {
        nombreRestaurante.value = res.data.nombre;
        document.title = res.data.nombre;
      }
      
      // 1.1 Logo (Prioridad: Icono 192 -> 512 -> Apple -> Defecto)
      if (res.data.icon_192_url) {
         logoUrl.value = res.data.icon_192_url;
      } else if (res.data.icon_512_url) {
         logoUrl.value = res.data.icon_512_url;
      } else if (res.data.apple_touch_icon_url) {
         logoUrl.value = res.data.apple_touch_icon_url;
      }
      
      // 2. Colores
      if (res.data.color_primario) {
        document.documentElement.style.setProperty('--theme-color', res.data.color_primario);
      }
      if (res.data.color_secundario) {
        document.documentElement.style.setProperty('--background-color', res.data.color_secundario);
      }
    }
  } catch (err) {
    console.error('Error cargando configuración:', err);
  }
};

const isPublicMenu = ref(false);
const isPublicMesasQR = ref(false);
const isPublicPedidoStatus = ref(false);
const isConnected = ref(false);
const isPublicCuenta = ref(false);
const isCustomerFlow = ref(false); 

const usuarioStore = useUsuarioStore();
const pedidoStore = usePedidoStore();

// Cargar usuario guardado al montar
onMounted(() => {
  usuarioStore.cargarUsuarioGuardado();
  pedidoStore.iniciarRealTime(); // Iniciar listeners de Socket.io
  cargarConfiguracion(); // ✅ NUEVO: Cargar config completa (nombre + colores)
  
  // Monitorear conexión
  if (socket.connected) isConnected.value = true;
  
  socket.on('connect', () => {
    isConnected.value = true;
  });
  
  socket.on('disconnect', () => {
    isConnected.value = false;
  });

  // Detectar si estamos en rutas públicas
  const path = window.location.pathname;
  if (path === '/menu') {
    isPublicMenu.value = true;
  } else if (path.startsWith('/pedido/') && path.endsWith('/status')) {
    isPublicPedidoStatus.value = true;
  } else if (path.startsWith('/mesa/') && !path.includes('/welcome') && !path.includes('/menu') && !path.includes('/status')) {
     isPublicPedidoStatus.value = false; 
  } else if (path.startsWith('/mesa/')) {
     isCustomerFlow.value = true;
  } else if (path === '/mesas-qr') {
    isPublicMesasQR.value = true;
  } else if (path.startsWith('/cuenta/')) {      
    isPublicCuenta.value = true;
  }
});

const logout = () => {
  usuarioStore.logout();
};

const obtenerNombreRol = (rol) => {
  return t('roles.' + rol) || rol;
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --nav-height: 64px;
  --nav-bg: #ffffff;
  --nav-border: #e2e8f0;
  --nav-text: #1e293b;
  --primary-color: #f97316;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  margin: 0;
  background-color: #f8fafc;
  color: var(--nav-text);
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.navbar {
  background: var(--nav-bg);
  height: var(--nav-height);
  border-bottom: 1px solid var(--nav-border);
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  padding: 0 16px; /* Reduced from 24px */
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 12px; /* Reduced from 24px */
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px; /* Reduced from 12px */
}

.brand-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white; /* Changed to white */
  box-shadow: 0 2px 5px rgba(0,0,0,0.1); /* Softer shadow */
  overflow: hidden; /* Ensure image stays inside */
}

.brand-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo {
  font-size: 1.1rem; /* Slightly smaller */
  font-weight: 700;
  margin: 0;
  color: var(--nav-text);
  letter-spacing: -0.5px;
}

.status-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.status-pill.connected {
  background: #dcfce7;
  color: #166534;
  border-color: #bbf7d0;
}

.status-pill.disconnected {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px; /* Reduced from 16px */
}

.divider {
  width: 1px;
  height: 20px;
  background: var(--nav-border);
}

.rol-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.rol-mesero { background: #eff6ff; color: #1d4ed8; }
.rol-cocinero { background: #fff7ed; color: #c2410c; }
.rol-facturero, .rol-cajero { background: #ecfdf5; color: #047857; }
.rol-admin { background: #f5f3ff; color: #6d28d9; }

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.usuario-nombre {
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--nav-text);
}

.btn-logout-icon {
  background: white;
  color: #64748b;
  border: 1px solid var(--nav-border);
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout-icon:hover {
  background: #f1f5f9;
  color: #ef4444;
  border-color: #fecaca;
}

.main-content {
  flex: 1;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  padding: 24px;
}

/* Responsivo */
@media (max-width: 768px) {
  .logo { 
      display: none;
  }
  .status-text { display: none; }
  .usuario-nombre { display: none; }
  .divider { display: none; } /* Hide divider on mobile */
  
  .navbar-content {
    padding: 0 10px; /* Very tight padding on mobile */
  }
  
  .navbar-left { gap: 8px; }
  
  .rol-badge {
    font-size: 0.65rem;
    padding: 2px 6px;
  }
  
  .brand-icon {
      width: 28px;
      height: 28px;
  }
}
</style>
