<template>
  <div class="product-card" @click="emit('add', item)">
    <div class="image-container">
      <img 
        v-if="item.image_url" 
        :src="item.image_url" 
        :alt="item.nombre" 
        loading="lazy"
      />
      <div v-else class="image-placeholder">
        <span class="emoji">🍽️</span>
      </div>
      
      <div v-if="quantity > 0" class="quantity-badge">
        {{ quantity }}
      </div>
    </div>
    
    <div class="content">
      <div class="header">
        <h4 class="name">{{ item.nombre }}</h4>
        <span class="price">${{ formatPrice(item.precio) }}</span>
      </div>
      <p class="description" v-if="item.descripcion">{{ truncate(item.descripcion, 50) }}</p>
      
      <button class="btn-add">
        <Plus :size="16" />
        {{ $t('customer.add_to_cart') }}
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
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.product-card:active {
  transform: scale(0.98);
}

.image-container {
  height: 140px;
  background: #f1f5f9;
  position: relative;
  overflow: hidden;
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
  background: #f8fafc;
}

.quantity-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--primary-color, #ff6b6b);
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
}

.name {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.price {
  font-weight: 600;
  color: var(--primary-color, #ff6b6b);
  background: rgba(255, 107, 107, 0.1);
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.9rem;
}

.description {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0 0 1rem;
  flex: 1;
}

.btn-add {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid var(--primary-color, #ff6b6b);
  background: transparent;
  color: var(--primary-color, #ff6b6b);
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
  background: var(--primary-color, #ff6b6b);
  color: white;
}
</style>
