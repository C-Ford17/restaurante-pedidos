<template>
  <div class="cart-wrapper">
    <!-- Floating Button (always visible when items in cart) -->
    <transition name="pop">
      <button 
        v-if="cartCount > 0 && !isOpen" 
        class="fab-cart" 
        @click="isOpen = true"
      >
        <ShoppingBag :size="24" />
        <span class="badge">{{ cartCount }}</span>
      </button>
    </transition>

    <!-- Expanded Cart Modal/Sheet -->
    <transition name="slide-up">
      <div v-if="isOpen" class="cart-sheet">
        <div class="cart-header">
          <div class="header-left">
            <h3>{{ $t('customer.order_summary') }}</h3>
            <span class="item-count">{{ cartCount }} items</span>
          </div>
          <button class="btn-close" @click="isOpen = false">
            <X :size="24" />
          </button>
        </div>

        <div class="cart-items">
          <div v-if="cart.length === 0" class="empty-state">
            <p>{{ $t('customer.empty_cart') }}</p>
          </div>
          
          <div v-for="item in cart" :key="item.cartItemId" class="cart-item">
            <div class="item-container">
              <div class="item-header">
                <div class="item-details">
                  <h4>{{ item.nombre }}</h4>
                  <p class="price">${{ (item.precio * item.quantity).toFixed(0) }}</p>
                </div>
                
                <div class="item-actions">
                  <!-- Split Button (Ungroup) -->
                  <button 
                    v-if="item.quantity > 1" 
                    class="btn-split" 
                    @click="store.splitCartItem(item.cartItemId)"
                    title="Split item"
                  >
                    <Scissors :size="16" />
                  </button>

                  <div class="quantity-controls">
                    <button @click="updateQty(item.cartItemId, -1)">-</button>
                    <span>{{ item.quantity }}</span>
                    <button @click="updateQty(item.cartItemId, 1)">+</button>
                  </div>
                </div>
              </div>

              <!-- Notes Input -->
              <div class="item-notes">
                <input 
                  type="text" 
                  :placeholder="$t('customer.notes_placeholder')"
                  :value="item.notas"
                  @input="(e) => store.updateCartNotes(item.cartItemId, e.target.value)"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="cart-footer">
          <div class="total-row">
            <span>{{ $t('customer.cart_total') }}</span>
            <span class="total-amount">${{ total.toFixed(0) }}</span>
          </div>
          <button class="btn-checkout" @click="confirmOrder" :disabled="cart.length === 0 || isSubmitting">
            {{ isSubmitting ? $t('common.sending') : $t('customer.place_order') }}
            <ArrowRight :size="20" />
          </button>
        </div>
      </div>
    </transition>
    
    <!-- Backdrop -->
    <transition name="fade">
      <div v-if="isOpen" class="backdrop" @click="isOpen = false"></div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePedidoStore } from '@/stores/pedidoStore';
import { ShoppingBag, X, ArrowRight, Scissors } from 'lucide-vue-next'; // Scissors added
import { useRoute, useRouter } from 'vue-router';

const store = usePedidoStore();
const route = useRoute();
const router = useRouter();

const isOpen = ref(false);
const isSubmitting = ref(false);

const cart = computed(() => store.cart);
const cartCount = computed(() => store.cartItemCount);
const total = computed(() => store.cartTotal);

const updateQty = (cartItemId, delta) => {
  store.updateCartQuantity(cartItemId, delta);
  if (cartCount.value === 0) isOpen.value = false;
};

const confirmOrder = async () => {
  if (isSubmitting.value) return;
  
  isSubmitting.value = true;
  const tableId = route.params.tableId; // Get table ID from URL
  
  try {
    // Assuming backend needs: (mesa_numero, usuario_mesero_id, items, notas)
    // For customer self-service, we might need a specific 'customer' or default waiter ID, or backend handles null.
    // For now passing null for waiter ID if allowed, or check logic.
    // Ideally backend identifies source. Let's try passing 'CUSTOMER' or null.
    
    // Transform cart to expected format if needed
    const itemsPayload = cart.value.map(i => ({
      menu_item_id: i.id, // ✅ Backend expects 'menu_item_id'
      cantidad: i.quantity,
      precio_unitario: i.precio, // ✅ Backend might need price if not re-fetching perfectly or for optimistic UI
      notas: i.notas || ''
    }));

    await store.crearPedido(tableId, null, itemsPayload, 'Self-Order');
    
    store.clearCart();
    isOpen.value = false;
    router.push(`/mesa/${tableId}/status`);
  } catch (err) {
    console.error('Order failed', err);
    alert('Error sending order. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.cart-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  pointer-events: none;
  display: flex;
  justify-content: center;
}

.fab-cart {
  pointer-events: auto;
  position: absolute;
  bottom: 2rem;
  right: 2rem; /* Floating on right by default */
  background: var(--theme-color, #ff6b6b);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.4);
  font-weight: 700;
  cursor: pointer;
  z-index: 102;
}

.badge {
  background: white;
  color: var(--theme-color);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.9rem;
}

.cart-sheet {
  pointer-events: auto;
  position: absolute;
  bottom: 0;
  width: 100%;
  max-width: 600px;
  background: var(--customer-surface);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -4px 20px var(--customer-shadow);
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  z-index: 102;
}

.cart-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--customer-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--customer-text-primary);
}

.item-count {
  font-size: 0.9rem;
  color: var(--customer-text-secondary);
}

.btn-close {
  background: var(--customer-bg-tertiary);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--customer-text-primary);
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.cart-item {
  border-bottom: 1px solid var(--customer-border);
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
}

.item-container {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  width: 100%;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-details h4 {
  margin: 0 0 0.3rem;
  font-size: 1rem;
  color: var(--customer-text-primary);
}

.price {
  margin: 0;
  color: var(--theme-color);
  font-weight: 600;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-split {
  background: var(--customer-surface);
  border: 1px dashed var(--customer-border);
  border-radius: 8px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--customer-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-split:active {
  transform: scale(0.9);
  background: var(--customer-bg-tertiary);
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--customer-bg-tertiary);
  padding: 4px;
  border-radius: 12px;
}

.quantity-controls button {
  width: 28px;
  height: 28px;
  border: none;
  background: var(--customer-surface);
  border-radius: 8px;
  box-shadow: 0 1px 3px var(--customer-shadow);
  font-weight: bold;
  cursor: pointer;
  color: var(--customer-text-primary);
}

.item-notes input {
  width: 100%;
  border: 1px solid var(--customer-border);
  border-radius: 8px;
  padding: 0.5rem;
  font-size: 0.9rem;
  background: var(--customer-bg-tertiary);
  color: var(--customer-text-primary);
}

.item-notes input:focus {
  outline: none;
  border-color: var(--theme-color);
  background: var(--customer-surface);
}

.cart-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--customer-border);
  background: var(--customer-surface);
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--customer-text-primary);
}

.btn-checkout {
  width: 100%;
  padding: 1rem;
  background: var(--theme-color, #ff6b6b);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
}

.btn-checkout:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.backdrop {
  pointer-events: auto;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(2px);
  z-index: 101;
}

/* Transitions */
.pop-enter-active, .pop-leave-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: scale(0.8) translateY(20px); }

.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
