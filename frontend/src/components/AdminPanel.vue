<template>
  <div class="admin-panel-shell">
    <!-- Hamburger Button -->
    <button class="hamburger-btn" @click="sidebarOpen = !sidebarOpen" :class="{ open: sidebarOpen }">
      <Menu :size="24" />
    </button>

    <!-- Overlay -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>

    <!-- Sidebar Navigation -->
    <aside class="admin-sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <span class="logo-icon">⚙️</span>
          <span class="logo-text">Admin</span>
        </div>
        <button class="close-sidebar" @click="sidebarOpen = false">
          <X :size="20" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <button 
          :class="['nav-item', { active: activeView === 'dashboard' }]"
          @click="navigateTo('dashboard')"
        >
          <span class="nav-icon">📊</span>
          <span class="nav-label">Dashboard</span>
        </button>

        <button 
          :class="['nav-item', { active: activeView === 'editor' }]"
          @click="navigateTo('editor')"
        >
          <span class="nav-icon">🛠️</span>
          <span class="nav-label">{{ $t('admin.editor') }}</span>
        </button>

        <button 
          :class="['nav-item', { active: activeView === 'users' }]"
          @click="navigateTo('users')"
        >
          <span class="nav-icon">👥</span>
          <span class="nav-label">{{ $t('admin.users') }}</span>
        </button>

        <button 
          :class="['nav-item', { active: activeView === 'inventory' }]"
          @click="navigateTo('inventory')"
        >
          <span class="nav-icon">📦</span>
          <span class="nav-label">Inventario</span>
        </button>
      </nav>
    </aside>

    <!-- Main Content Area -->
    <main class="admin-main">
      <AdminDashboard v-if="activeView === 'dashboard'" />
      <EditorPanel v-else-if="activeView === 'editor'" @volver="activeView = 'dashboard'" />
      <AdminUsers v-else-if="activeView === 'users'" @volver="activeView = 'dashboard'" />
      <AdminInventory v-else-if="activeView === 'inventory'" @volver="activeView = 'dashboard'" />
      <div v-else>Vista: {{ activeView }}</div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Menu, X } from 'lucide-vue-next';
import AdminDashboard from './AdminDashboard.vue';
import EditorPanel from './EditorPanel.vue';
import AdminUsers from './AdminUsers.vue';
import AdminInventory from './AdminInventory.vue';

const activeView = ref('dashboard');
const sidebarOpen = ref(false);

const navigateTo = (view) => {
  activeView.value = view;
  // Cerrar sidebar siempre al navegar (comportamiento tipo drawer)
  sidebarOpen.value = false;
  
  // Reset scroll position
  const mainContent = document.querySelector('.admin-main');
  if (mainContent) {
    mainContent.scrollTop = 0;
  }
};
</script>

<style scoped>
.admin-panel-shell {
  display: flex;
  min-height: 100vh;
  background: var(--bg-color);
  position: relative;
  transition: background-color 0.3s;
}

/* Hamburger Button */
.hamburger-btn {
  position: fixed;
  left: 16px;
  top: calc(var(--nav-height, 64px) + 16px);
  z-index: 100;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  color: var(--text-secondary);
}

.hamburger-btn:hover {
  background: var(--theme-color, #f97316);
  color: white;
  border-color: var(--theme-color, #f97316);
}

.hamburger-btn.open {
  left: 256px;
}

/* Sidebar Overlay */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 60;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Sidebar Styles */
.admin-sidebar {
  width: 240px;
  background: var(--card-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: -240px;
  top: var(--nav-height, 64px);
  bottom: 0;
  z-index: 70;
  box-shadow: 2px 0 8px rgba(0,0,0,0.03);
  transition: left 0.3s ease, background-color 0.3s, border-color 0.3s;
}

.admin-sidebar.open {
  left: 0;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-sidebar {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
  display: none;
}

.close-sidebar:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.logo-icon {
  font-size: 1.5rem;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 500;
  text-align: left;
  width: 100%;
}

.nav-item:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.nav-item.active {
  background: linear-gradient(135deg, var(--theme-color, #f97316) 0%, #ea580c 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
}

.nav-icon {
  font-size: 1.2rem;
  min-width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-label {
  flex: 1;
}

/* Main Content Area */
.admin-main {
  flex: 1;
  margin-left: 0;
  padding: 32px;
  padding-top: 80px; /* Space for hamburger button */
  overflow-y: auto;
  max-width: 1600px;
  width: 100%;
  color: var(--text-primary);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* Desktop: Show close button on mobile only */
@media (max-width: 768px) {
  .close-sidebar {
    display: block;
  }
  
  .admin-main {
    padding: 20px;
    padding-top: 80px;
  }
}
</style>
