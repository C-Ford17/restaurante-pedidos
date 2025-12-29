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
  </div>
</template>

<script setup>
// Layout specific for customer view
// Could include a common header or footer if needed in the future
</script>

<style scoped>
.customer-layout {
  min-height: 100vh;
  background-color: var(--bg-color, #f8fafc);
  color: var(--text-color, #1e293b);
  display: flex;
  flex-direction: column;
}

.customer-content {
  flex: 1;
  width: 100%;
  max-width: 600px; /* Mobile-first focus */
  margin: 0 auto;
  position: relative;
  background: white;
  min-height: 100vh;
  box-shadow: 0 0 20px rgba(0,0,0,0.05);
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
