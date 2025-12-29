<template>
  <div class="customer-menu">
    <!-- Header -->
    <header class="menu-header">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          :placeholder="$t('waiter.search_dishes')" 
          v-model="searchQuery"
        />
      </div>
      <div class="categories-scroll">
        <button 
          v-for="cat in categorias" 
          :key="cat"
          :class="{ active: selectedCategory === cat }"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
    </header>

    <!-- Menu Grid -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else class="menu-grid">
      <div class="category-section" v-for="cat in filteredCategories" :key="cat">
        <h3 class="category-title" v-if="!searchQuery || filteredCategories.length > 1">{{ cat }}</h3>
        
        <div class="items-container">
          <ProductCard 
            v-for="item in getItemsByCategory(cat)" 
            :key="item.id" 
            :item="item"
            :quantity="getItemQuantity(item.id)"
            @add="handleAddItem"
          />
        </div>
      </div>
    </div>

    <!-- Floating Cart Button -->
    <CartFloatingButton />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { usePedidoStore } from '@/stores/pedidoStore';
import ProductCard from '@/components/customer/ProductCard.vue';
import CartFloatingButton from '@/components/customer/CartFloatingButton.vue';

const pedidoStore = usePedidoStore();
const searchQuery = ref('');
const selectedCategory = ref('Todos');

const loading = computed(() => pedidoStore.loading);
const categorias = computed(() => ['Todos', ...pedidoStore.categorias]);

const filteredCategories = computed(() => {
  if (selectedCategory.value !== 'Todos') return [selectedCategory.value];
  if (searchQuery.value) {
    // If searching, show all categories that have matching items
    return pedidoStore.categorias.filter(cat => getItemsByCategory(cat).length > 0);
  }
  return pedidoStore.categorias;
});

const getItemsByCategory = (cat) => {
  // ✅ FIX: Use 'disponible' instead of 'menu_activo'
  // Also check if 'disponible' is string "true" or boolean true if using SQLite/Postgres weirdness, 
  // but mostly likely boolean. 'item.disponible' should be truthy.
  let items = pedidoStore.menu.filter(item => item.categoria === cat && item.disponible);
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    items = items.filter(i => 
      i.nombre.toLowerCase().includes(q) || 
      (i.descripcion && i.descripcion.toLowerCase().includes(q))
    );
  }
  return items;
};

const getItemQuantity = (itemId) => {
  return pedidoStore.cart
    .filter(i => i.id === itemId)
    .reduce((sum, i) => sum + i.quantity, 0);
};

const handleAddItem = (item) => {
  pedidoStore.addToCart(item);
  // Optional: Trigger a small haptic feedback or local animation here if needed
};

onMounted(() => {
  // Load menu if empty
  if (pedidoStore.menu.length === 0) {
    pedidoStore.cargarMenu();
    // Assuming we don't need authentication to read the menu, otherwise token might be needed?
    // User said "Start Order" -> "Menu", assuming public access or implicit session.
  }
  // Start socket for real-time stock updates
  pedidoStore.iniciarRealTime(); 
});
</script>

<style scoped>
.customer-menu {
  padding-bottom: 100px; /* Space for FAB */
  background: #f8fafc;
  min-height: 100vh;
}

.menu-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.search-bar {
  display: flex;
  align-items: center;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 0.8rem 1rem;
  margin-bottom: 1rem;
}

.search-icon {
  margin-right: 0.5rem;
  opacity: 0.5;
}

.search-bar input {
  border: none;
  background: transparent;
  width: 100%;
  font-size: 1rem;
  outline: none;
}

.categories-scroll {
  display: flex;
  gap: 0.8rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: none;
}

.categories-scroll::-webkit-scrollbar {
  display: none;
}

.categories-scroll button {
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.2s;
}

.categories-scroll button.active {
  background: var(--primary-color, #ff6b6b);
  color: white;
  border-color: var(--primary-color, #ff6b6b);
  box-shadow: 0 4px 10px rgba(255, 107, 107, 0.3);
}

.menu-grid {
  padding: 1rem;
}

.category-title {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 1.5rem 0 1rem;
  color: #1e293b;
}

.items-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color, #ff6b6b);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
