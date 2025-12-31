<template>
  <div class="product-card" @click="canAdd ? emit('add', item) : null" :class="{ 'disabled': !canAdd }">
    <div class="image-container">
      <img 
        v-if="item.image_url" 
        :src="item.image_url" 
        :alt="item.nombre" 
        loading="lazy"
        :class="{ 'grayscale': !canAdd }"
      />
      <div v-else class="image-placeholder" :class="{ 'grayscale': !canAdd }">
        <span class="emoji">🍽️</span>
      </div>
      
      <!-- Badges -->
      <div v-if="quantity > 0" class="quantity-badge">
        {{ quantity }}
      </div>

      <!-- NEW: Remaining Stock Counter -->
      <div v-if="showStockCounter" class="stock-badge remaining" :class="{ 'warn': remainingStock < 5 }">
        {{ remainingStock }} {{ $t('waiter.available') || 'disp.' }}
      </div>

      <div v-if="isSoldOut" class="stock-badge out">
        {{ $t('waiter.sold_out') || 'Agotado' }}
      </div>
      <div v-else-if="isLowStock && !showStockCounter" class="stock-badge low">
        {{ $t('waiter.low_stock') || 'Poco Stock' }}
      </div>
    </div>
    
    <div class="content">
      <div class="header">
        <h4 class="name">{{ item.nombre }}</h4>
        <span class="price">${{ formatPrice(item.precio) }}</span>
      </div>
      <p class="description" v-if="item.descripcion">{{ truncate(item.descripcion, 50) }}</p>
      
      <button class="btn-add" :disabled="!canAdd">
        <Plus :size="16" />
        {{ canAdd ? $t('customer.add_to_cart') : ($t('waiter.out_of_stock') || 'Agotado') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Plus } from 'lucide-vue-next';

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  quantity: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['add']);

// Stock Logic
const stockDisponible = computed(() => {
  if (!props.item.usa_inventario || props.item.es_directo) return 9999;
  return (props.item.stock_actual || 0) - (props.item.stock_reservado || 0);
});

// ✅ Dynamic remaining stock (decreases as you add to cart)
const remainingStock = computed(() => {
  return Math.max(0, stockDisponible.value - props.quantity);
});

const showStockCounter = computed(() => {
  return props.item.usa_inventario && !props.item.es_directo && remainingStock.value < 9999;
});

const isSoldOut = computed(() => {
   // Assuming 'no_disponible' state or calculated stock <= 0
   return props.item.estado_inventario === 'no_disponible' || stockDisponible.value <= 0;
});

const isLowStock = computed(() => {
  return props.item.estado_inventario === 'poco_stock' && !isSoldOut.value;
});

const canAdd = computed(() => {
  if (isSoldOut.value) return false;
  // Check if adding 1 more would exceed stock based on REMAINING
  return remainingStock.value > 0;
});

const formatPrice = (price) => {
  return typeof price === 'number' ? price.toFixed(0) : price;
};

const truncate = (text, length) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};
</script>

<style scoped>
.product-card {
  background: var(--customer-surface);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px var(--customer-shadow);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.product-card:active {
  transform: scale(0.98);
}

.product-card.disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

.image-container {
  height: 140px;
  background: var(--customer-bg-tertiary);
  position: relative;
  overflow: hidden;
}

.grayscale {
  filter: grayscale(100%);
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  background: var(--customer-bg-secondary);
}

.quantity-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--theme-color, #ff6b6b);
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  z-index: 2;
}

.stock-badge {
  position: absolute;
  top: 8px;
  left: 8px; /* Different position than quantity */
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.stock-badge.out {
  background: #ef4444; /* Red */
  color: white;
}

.stock-badge.low {
  background: #f59e0b; /* Amber */
  color: white;
}

/* Fix visibility for remaining stock */
.stock-badge.remaining {
  background: rgba(255, 255, 255, 0.95);
  color: #1e293b;
  border: 1px solid rgba(0,0,0,0.1);
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.stock-badge.remaining.warn {
  color: #c2410c; /* Orange text for low stock warning */
  border-color: #fdba74;
  background: #fff7ed;
}

.content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  gap: 8px;
}

.name {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  color: var(--customer-text-primary);
}

.price {
  font-weight: 600;
  color: var(--theme-color, #ff6b6b);
  background: rgba(255, 107, 107, 0.1);
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.9rem;
  white-space: nowrap;
}

.description {
  font-size: 0.85rem;
  color: var(--customer-text-secondary);
  margin: 0 0 1rem;
  flex: 1;
}

.btn-add {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid var(--theme-color, #ff6b6b);
  background: transparent;
  color: var(--theme-color, #ff6b6b);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-add:hover {
  background: var(--theme-color, #ff6b6b);
  color: white;
}

.btn-add:disabled {
  border-color: var(--customer-border);
  background: var(--customer-bg-tertiary);
  color: var(--customer-text-tertiary);
  cursor: not-allowed;
}
</style>
