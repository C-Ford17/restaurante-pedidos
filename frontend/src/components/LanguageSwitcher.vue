<template>
  <div class="language-switcher">
    <button @click="toggleDropdown" class="lang-btn" title="Cambiar idioma">
      <Globe :size="18" />
      <span class="lang-code">{{ currentLocale.toUpperCase() }}</span>
      <ChevronDown :size="14" />
    </button>
    
    <div v-if="isOpen" class="lang-dropdown" @click.stop>
      <button 
        v-for="lang in supportedLanguages" 
        :key="lang.code" 
        @click="selectLanguage(lang.code)"
        :class="['lang-option', { active: currentLocale === lang.code }]"
      >
        <span class="flag">{{ lang.flag }}</span>
        <span class="name">{{ lang.name }}</span>
        <Check :size="14" v-if="currentLocale === lang.code" class="check-icon" />
      </button>
    </div>
    
    <!-- Backdrop to close -->
    <div v-if="isOpen" class="backdrop" @click="isOpen = false"></div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Globe, ChevronDown, Check } from 'lucide-vue-next';

const { locale } = useI18n();
const isOpen = ref(false);

const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

const currentLocale = computed({
  get: () => locale.value,
  set: (val) => {
    locale.value = val;
    localStorage.setItem('locale', val);
  }
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectLanguage = (code) => {
  currentLocale.value = code;
  isOpen.value = false;
};
</script>

<style scoped>
.language-switcher {
  position: relative;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: white;
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  color: #64748b;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.lang-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
  border-color: #cbd5e1;
}

.lang-dropdown {
  position: absolute;
  top: 120%;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 6px;
  min-width: 150px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lang-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  border-radius: 8px;
  color: #475569;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.lang-option:hover {
  background: #f8fafc;
  color: #1e293b;
}

.lang-option.active {
  background: #f0f9ff;
  color: #0284c7;
  font-weight: 600;
}

.check-icon {
  margin-left: auto;
  color: #0284c7;
}

.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999;
  background: transparent;
}
</style>
