<template>
  <div id="app" class="app-container">
    <!-- Vista Pública del Menú -->
    <MenuView v-if="isPublicMenu" />

    <!-- Vista Pública de los Códigos QR -->
    <MesasQR v-else-if="isPublicMesasQR" />

    <!-- Vista Pública del Estado del Pedido -->
    <PedidoStatus v-else-if="isPublicPedidoStatus" />
    
    <!-- ✅ Flujo de Cliente Y Cuenta (Router) -->
    <router-view v-else-if="isCustomerFlow || isPublicCuenta" />

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
              
              <div class="user-menu-container" ref="userMenuRef">
                <button @click="toggleUserMenu" class="user-btn" :class="{ active: isUserMenuOpen }">
                   <div class="avatar-circle">
                    {{ usuarioStore.usuario.nombre.charAt(0).toUpperCase() }}
                  </div>
                  <span class="usuario-nombre">{{ usuarioStore.usuario.nombre }}</span>
                  <ChevronDown :size="16" class="chevron-icon" :class="{ rotated: isUserMenuOpen }" />
                </button>

                <!-- Dropdown Menu -->
                <transition name="fade-slide">
                  <div v-if="isUserMenuOpen" class="user-dropdown">
                    <!-- Header Profile -->
                    <div class="dropdown-header">
                       <div class="avatar-large">
                         {{ usuarioStore.usuario.nombre.charAt(0).toUpperCase() }}
                       </div>
                       <div class="user-info">
                         <span class="name">{{ usuarioStore.usuario.nombre }}</span>
                         <span class="role">{{ obtenerNombreRol(usuarioStore.usuario.rol) }}</span>
                       </div>
                    </div>

                    <div class="dropdown-divider"></div>

                    <!-- Theme Toggles -->
                    <div class="dropdown-section">
                       <span class="section-label">Tema</span>
                       <div class="theme-toggles">
                          <button @click="setTheme('light')" class="theme-btn" :class="{ active: !isDarkMode }" title="Claro">
                             <Sun :size="18" />
                          </button>
                          <button @click="setTheme('dark')" class="theme-btn" :class="{ active: isDarkMode }" title="Oscuro">
                             <Moon :size="18" />
                          </button>
                       </div>
                    </div>

                     <!-- Language Options -->
                    <div class="dropdown-section">
                       <span class="section-label">Idioma</span>
                       <div class="lang-options">
                          <button 
                            v-for="lang in supportedLanguages" 
                            :key="lang.code"
                            @click="setLanguage(lang.code)"
                            class="lang-item"
                            :class="{ active: locale === lang.code }"
                          >
                            <span class="flag">{{ lang.flag }}</span>
                            <span class="lang-name">{{ lang.name }}</span>
                            <Check v-if="locale === lang.code" :size="14" class="check-icon" />
                          </button>
                       </div>
                    </div>

                    <div class="dropdown-divider"></div>

                    <!-- Logout -->
                    <button @click="logout" class="dropdown-item danger">
                      <LogOut :size="16" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </transition>
              </div>
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
    <!-- Banner de Actualización -->
    <transition name="slide-up">
      <div v-if="updateAvailable" class="update-banner">
        <div class="update-content">
          <AlertTriangle :size="20" class="update-icon" />
          <div class="update-text">
            <strong>{{ $t('common.update_available') }}</strong>
            <span>{{ $t('common.update_desc', { version: remoteVersion }) }}</span>
          </div>
        </div>
        <button @click="reloadApp" class="btn-refresh-app">
          <RefreshCw :size="16" class="icon-spin-hover" />
          {{ $t('common.refresh') }}
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
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
import { 
  UtensilsCrossed, LogOut, Wifi, WifiOff, ChevronDown, 
  Sun, Moon, Check, Globe, AlertTriangle, RefreshCw 
} from 'lucide-vue-next';

import socket from './socket';
import api from './api'; 
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const title = import.meta.env.VITE_APP_TITLE;

// ✅ NUEVO: Nombre dinámico del restaurante
const nombreRestaurante = ref(import.meta.env.VITE_APP_TITLE || 'Restaurante Demo');
const logoUrl = ref('/vite.svg'); // Default logo

// Dropdown State
const isUserMenuOpen = ref(false);
const userMenuRef = ref(null);
const isDarkMode = ref(false);

// Update State
const updateAvailable = ref(false);
const remoteVersion = ref('');
// eslint-disable-next-line no-undef
const currentVersion = __APP_VERSION__;

const supportedLanguages = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
];

const toggleUserMenu = (event) => {
  // console.log('🔘 User Menu Toggled. Previous state:', isUserMenuOpen.value);
  // console.log('🔘 Event type:', event?.type);
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

// Close dropdown on click outside
const handleClickOutside = (event) => {
  if (isUserMenuOpen.value && userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    // console.log('👋 Click outside detected. Closing menu.');
    isUserMenuOpen.value = false;
  }
};

// Theme Logic
const setTheme = (theme) => {
  isDarkMode.value = theme === 'dark';
  document.documentElement.classList.toggle('dark', isDarkMode.value);
  localStorage.setItem('theme', theme);
};

const setLanguage = (code) => {
  locale.value = code;
  localStorage.setItem('locale', code);
};

const checkForUpdates = (serverVersion) => {
  if (serverVersion && serverVersion !== currentVersion) {
    console.log(`✨ Update available: ${currentVersion} -> ${serverVersion}`);
    remoteVersion.value = serverVersion;
    updateAvailable.value = true;
  }
};

const reloadApp = async () => {
  console.log('🔄 Forzando actualización de la aplicación...');
  
  if ('serviceWorker' in navigator) {
    // 1. Desregistrar todos los Service Workers
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
      console.log('🧹 SW Desregistrado');
    }
  }

  // 2. Limpiar cache de almacenamiento (opcional, pero recomendado para actualizaciones críticas)
  if ('caches' in window) {
    const keys = await caches.keys();
    for (const key of keys) {
      await caches.delete(key);
      console.log('🧹 Cache eliminado:', key);
    }
  }

  // 3. Recargar forzosamente
  window.location.reload(true);
};

const cargarConfiguracion = async () => {
  try {
    const res = await api.getConfig();
    if (res.data) {
      // Check for updates
      if (res.data.app_version) {
        checkForUpdates(res.data.app_version);
      }

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

// Detectar si estamos en rutas públicas
const route = useRoute();

const updatePublicState = () => {
  const path = route.path;
  
  // Reset all first
  isPublicMenu.value = false;
  isPublicMesasQR.value = false;
  isPublicPedidoStatus.value = false;
  isCustomerFlow.value = false;
  isPublicCuenta.value = false;
  
  if (path === '/menu') {
    isPublicMenu.value = true;
  } else if (path.startsWith('/pedido/') && path.endsWith('/status')) {
    isPublicPedidoStatus.value = true;
  } else if (path.startsWith('/mesa/') && !path.includes('/welcome') && !path.includes('/menu') && !path.includes('/status')) {
     // Legacy check, might not be needed if all new flows are under /mesa/:id/...
     isPublicPedidoStatus.value = false; 
  } else if (path.startsWith('/mesa/')) {
     isCustomerFlow.value = true;
  } else if (path === '/mesas-qr') {
    isPublicMesasQR.value = true;
  } else if (path.startsWith('/cuenta/')) {      
    isPublicCuenta.value = true;
  }
};

// Watch for route changes
watch(() => route.path, () => {
  updatePublicState();
});

let updateInterval;

onMounted(() => {
  usuarioStore.cargarUsuarioGuardado();
  pedidoStore.iniciarRealTime(); // Iniciar listeners de Socket.io
  cargarConfiguracion(); // ✅ NUEVO: Cargar config completa (nombre + colores)
  
  // Theme init
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark');
  }

  document.addEventListener('click', handleClickOutside);
  
  // Monitorear conexión
  if (socket.connected) isConnected.value = true;
  
  socket.on('connect', () => {
    isConnected.value = true;
    cargarConfiguracion(); // Re-check config/version on reconnect
  });
  
  socket.on('disconnect', () => {
    isConnected.value = false;
  });

  // Poll for updates every 5 minutes
  updateInterval = setInterval(() => {
    cargarConfiguracion();
  }, 5 * 60 * 1000);

  // Check on visibility change (when tab becomes active)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      cargarConfiguracion();
    }
  });

  // Initial check
  updatePublicState();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  if (updateInterval) clearInterval(updateInterval);
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
  --bg-color: #f8fafc;
  --card-bg: #ffffff;
  --border-color: #e2e8f0;
  
  /* Semantic Colors */
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --bg-secondary: #f1f5f9;
  /* Semantic Colors */
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --bg-secondary: #f1f5f9;
  
  /* Custom Component Variables */
  --pf-border-color: #cbd5e1; /* Higher contrast border for light mode */
}

/* Dark Mode Variables */
.dark {
  --nav-bg: #1e293b;
  --nav-border: #334155;
  --nav-text: #f8fafc;
  --bg-color: #0f172a;
  --card-bg: #1e293b;
  --border-color: #334155;
  
  /* Semantic Colors */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --bg-secondary: #334155;
  
  --pf-border-color: #475569; /* Lighter border for visual usage in Dark Mode (Slate 600) */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --bg-secondary: #334155;
  
  color-scheme: dark;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  margin: 0;
  background-color: var(--bg-color);
  color: var(--nav-text);
  transition: background-color 0.3s, color 0.3s;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--bg-color);
  position: relative; /* For fixed banner */
}

/* Update Banner Styles */
.update-banner {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--card-bg);
  border: 1px solid var(--primary-color);
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 9999;
  min-width: 320px;
  justify-content: space-between;
}

.update-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.update-icon {
  color: var(--primary-color);
}

.update-text {
  display: flex;
  flex-direction: column;
}

.update-text strong {
  font-size: 0.95rem;
  color: var(--text-primary);
}

.update-text span {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.btn-refresh-app {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-refresh-app:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.icon-spin-hover:hover {
  animation: spin 1s linear infinite;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translate(-50%, 100%);
  opacity: 0;
  bottom: -20px;
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
  transition: background-color 0.3s, border-color 0.3s;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  padding: 0 16px;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  overflow: hidden;
}

.brand-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo {
  font-size: 1.1rem;
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

.dark .status-pill {
    background: #334155;
    color: #94a3b8;
    border-color: #475569;
}

.status-pill.connected {
  background: #dcfce7;
  color: #166534;
  border-color: #bbf7d0;
}

.dark .status-pill.connected {
    background: #064e3b;
    color: #4ade80;
    border-color: #065f46;
}

.status-pill.disconnected {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
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

/* User Menu & Dropdown Styles */
.user-menu-container {
    position: relative;
    cursor: pointer;
}

.user-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    background: transparent;
    border: 1px solid transparent;
    padding: 6px 10px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
}

.user-btn:hover, .user-btn.active {
    background-color: rgba(0,0,0,0.03);
}

.dark .user-btn:hover, .dark .user-btn.active {
    background-color: rgba(255,255,255,0.05);
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

.chevron-icon {
    color: #94a3b8;
    transition: transform 0.2s;
}

.chevron-icon.rotated {
    transform: rotate(180deg);
}

/* Users Dropdown */
.user-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 260px;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    padding: 8px;
    z-index: 1000;
    overflow: hidden;
    animation: fadeSlideIn 0.2s ease-out;
}

.dropdown-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
}

.avatar-large {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--primary-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 700;
}

.user-info {
    display: flex;
    flex-direction: column;
}

.user-info .name {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--nav-text);
}

.user-info .role {
    font-size: 0.8rem;
    color: #64748b;
    text-transform: capitalize;
}

.dropdown-divider {
    height: 1px;
    background: var(--border-color);
    margin: 4px 0;
}

.dropdown-section {
    padding: 10px 12px;
}

.section-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Theme Toggles */
.theme-toggles {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    background: var(--bg-color);
    padding: 4px;
    border-radius: 8px;
}

.theme-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    padding: 6px;
    border-radius: 6px;
    cursor: pointer;
    color: #94a3b8;
    transition: all 0.2s;
}

.theme-btn.active {
    background: var(--card-bg);
    color: var(--primary-color);
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

/* Language Options */
.lang-options {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.lang-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border: none;
    background: transparent;
    border-radius: 8px;
    cursor: pointer;
    color: var(--nav-text);
    font-size: 0.9rem;
    transition: all 0.2s;
}

.lang-item:hover {
    background: var(--bg-color);
}

.lang-item.active {
    background: #eff6ff;
    color: #1d4ed8;
    font-weight: 500;
}

.dark .lang-item.active {
    background: #1e3a8a;
    color: #60a5fa;
}

/* Dropdown Item (Logout) */
.dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    width: 100%;
    border: none;
    background: transparent;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s;
    color: var(--nav-text);
}

.dropdown-item:hover {
    background: var(--bg-color);
}

.dropdown-item.danger {
    color: #ef4444;
}

.dropdown-item.danger:hover {
    background: #fef2f2;
}

.dark .dropdown-item.danger:hover {
    background: #451a1a;
}

@keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.main-content {
  flex: 1;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  padding: 24px;
  background-color: var(--bg-color);
}

/* Responsivo */
@media (max-width: 768px) {
  .logo { 
      display: none;
  }
  .status-text { display: none; }
  .usuario-nombre { display: none; }
  
  .navbar-content {
    padding: 0 10px;
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

  /* Adjust dropdown for mobile */
  .user-dropdown {
      width: 280px;
      right: -10px; 
  }
}
</style>
