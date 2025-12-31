<template>
  <div class="customer-layout">
    <!-- Main Content -->
    <main class="customer-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- Floating Theme Toggle -->
    <ThemeToggle />
  </div>
</template>

<script setup>
import ThemeToggle from '@/components/ThemeToggle.vue';
// Layout specific for customer view
// Could include a common header or footer if needed in the future
</script>

<style scoped>
.customer-layout {
  min-height: 100vh;
  background-color: var(--customer-bg-primary);
  color: var(--customer-text-primary);
  display: flex;
  flex-direction: column;
}

.customer-content {
  flex: 1;
  width: 100%;
  max-width: 600px; /* Mobile-first focus */
  margin: 0 auto;
  position: relative;
  background: var(--customer-surface);
  min-height: 100vh;
  box-shadow: 0 0 20px var(--customer-shadow);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
