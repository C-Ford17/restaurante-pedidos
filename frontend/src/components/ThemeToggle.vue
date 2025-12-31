<template>
  <div>
    <!-- Invisible swipe detection zone (only on mobile when hidden) -->
    <div 
      v-if="isMobile && isHidden"
      class="swipe-zone"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    ></div>
    
    <div 
      class="theme-toggle-container"
      :class="{ 'hidden': isHidden && isMobile }"
      @mouseenter="showButton"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- Edge tab (visible when hidden on mobile) -->
      <div v-if="isMobile" class="edge-tab" :class="{ 'visible': isHidden }">
        <div class="tab-indicator"></div>
      </div>
      
      <button 
        @click="toggleTheme" 
        class="theme-toggle-btn"
        :aria-label="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
      >
        <Sun v-if="isDark" :size="24" />
        <Moon v-else :size="24" />
      </button>
    </div>
  </div>
</template>

<script>
import { Sun, Moon } from 'lucide-vue-next';

export default {
  name: 'ThemeToggle',
  components: {
    Sun,
    Moon
  },
  data() {
    return {
      isDark: false,
      isHidden: false,
      hideTimeout: null,
      isMobile: false,
      touchStartX: 0,
      touchStartY: 0
    };
  },
  mounted() {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('customerTheme');
    if (savedTheme === 'dark') {
      this.isDark = true;
      document.documentElement.classList.add('customer-dark');
    }
    
    // Check if mobile
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
    
    // Start auto-hide timer only on mobile
    if (this.isMobile) {
      this.startHideTimer();
    }
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth < 768;
      // If switching to desktop, ensure button is visible
      if (!this.isMobile) {
        this.isHidden = false;
        if (this.hideTimeout) {
          clearTimeout(this.hideTimeout);
        }
      } else {
        // If switching to mobile, start hide timer
        this.startHideTimer();
      }
    },
    toggleTheme() {
      this.isDark = !this.isDark;
      
      if (this.isDark) {
        document.documentElement.classList.add('customer-dark');
        localStorage.setItem('customerTheme', 'dark');
      } else {
        document.documentElement.classList.remove('customer-dark');
        localStorage.setItem('customerTheme', 'light');
      }
      
      // Reset hide timer after interaction (only on mobile)
      if (this.isMobile) {
        this.showButton();
      }
    },
    showButton() {
      this.isHidden = false;
      if (this.isMobile) {
        this.startHideTimer();
      }
    },
    startHideTimer() {
      // Clear existing timer
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
      }
      
      // Hide after 3 seconds of inactivity (only on mobile)
      if (this.isMobile) {
        this.hideTimeout = setTimeout(() => {
          this.isHidden = true;
        }, 3000);
      }
    },
    handleTouchStart(e) {
      if (!this.isMobile) return;
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    },
    handleTouchMove(e) {
      if (!this.isMobile || !this.isHidden) return;
      
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const deltaX = touchX - this.touchStartX;
      const deltaY = Math.abs(touchY - this.touchStartY);
      
      // More lenient swipe detection:
      // - Accept swipe from right to left (deltaX < 0)
      // - Minimum horizontal movement: 20px (reduced from 30px)
      // - Maximum vertical movement: 80px (increased from 50px)
      // - OR if starting from right edge (within 50px from right)
      const windowWidth = window.innerWidth;
      const startedFromRightEdge = this.touchStartX > windowWidth - 50;
      
      if ((deltaX < -20 && deltaY < 80) || (startedFromRightEdge && deltaX < -10)) {
        this.showButton();
      }
    },
    handleTouchEnd() {
      this.touchStartX = 0;
      this.touchStartY = 0;
    }
  },
  beforeUnmount() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    window.removeEventListener('resize', this.checkMobile);
  }
};
</script>

<style scoped>
/* Invisible swipe detection zone - large area on right edge */
.swipe-zone {
  position: fixed;
  bottom: 80px; /* Same as button position */
  right: 0;
  width: 50px; /* 50px wide detection zone from right edge */
  height: 120px; /* Height zone around the button (60px above + 60px below button center) */
  z-index: 999; /* Just below the button */
  pointer-events: auto;
}

.theme-toggle-container {
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 1000;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.theme-toggle-container.hidden {
  transform: translateX(75px); /* Move 56px (button width) + 20px (right offset) - 12px (tab width) */
  opacity: 1; /* Keep visible for edge tab */
}

/* Edge tab - visible when button is hidden on mobile */
.edge-tab {
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 60px;
  background: var(--theme-color, #f97316);
  border-radius: 8px 0 0 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: -2px 0 8px var(--customer-shadow-lg);
}

.edge-tab.visible {
  opacity: 1;
}

.tab-indicator {
  width: 3px;
  height: 20px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 2px;
}

.theme-toggle-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--theme-color, #f97316);
  color: white;
  border: none;
  box-shadow: 0 4px 12px var(--customer-shadow-lg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.theme-toggle-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px var(--customer-shadow-lg);
}

.theme-toggle-btn:active {
  transform: scale(0.95);
}

/* Desktop: no edge tab or swipe zone needed */
@media (min-width: 768px) {
  .swipe-zone {
    display: none;
  }
  
  .edge-tab {
    display: none;
  }
  
  .theme-toggle-container.hidden {
    transform: translateX(0);
  }
}
</style>
