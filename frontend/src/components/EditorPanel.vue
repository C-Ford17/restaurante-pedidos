<template>
  <div class="editor-panel">
    <div class="editor-header no-print">
      <button @click="$emit('volver')" class="btn-secondary-outline btn-volver-full">
        <ArrowLeft :size="18" /> {{ $t('admin.back_to_panel') }}
      </button>
      
      <div class="header-title">
        <Settings :size="24" class="header-icon" />
        <h2>{{ $t('editor.title') }}</h2>
      </div>
      <div class="tabs-container">
        <button :class="['tab-btn', { active: activeTab === 'menu' }]" @click="activeTab = 'menu'">
          <UtensilsCrossed :size="18" />
          <span>{{ $t('editor.tabs.menu') }}</span>
        </button>
        <button :class="['tab-btn', { active: activeTab === 'categorias' }]" @click="activeTab = 'categorias'">
          <Tags :size="18" />
          <span>{{ $t('editor.tabs.categories') }}</span>
        </button>
        <button :class="['tab-btn', { active: activeTab === 'pagos' }]" @click="activeTab = 'pagos'">
          <CreditCard :size="18" />
          <span>{{ $t('editor.tabs.payments') }}</span>
        </button>
        <button :class="['tab-btn', { active: activeTab === 'config' }]" @click="activeTab = 'config'">
          <Settings :size="18" />
          <span>{{ $t('editor.tabs.config') }}</span>
        </button>
        <button :class="['tab-btn', { active: activeTab === 'mesas' }]" @click="activeTab = 'mesas'">
          <Grid3x3 :size="18" />
          <span>{{ $t('editor.tabs.tables') }}</span>
        </button>
      </div>
    </div>
    <div class="panel-body">
      <MenuEditor 
        v-if="activeTab === 'menu'"
        :menuItems="menuItems"
        :categories="categories"
        @refresh="cargarDatos"
      />
      <CategoriesEditor 
        v-else-if="activeTab === 'categorias'"
        :categories="categories"
        @refresh="cargarDatos"
      />
      <PaymentMethodsEditor 
        v-else-if="activeTab === 'pagos'"
        :paymentMethods="paymentMethods"
        @refresh="cargarDatos"
      />
      <ConfigEditor 
        v-else-if="activeTab === 'config'"
        :config="config"
        @refresh="cargarDatos"
      />
      <TablesEditor 
        v-else-if="activeTab === 'mesas'"
        :tables="tables"
        @refresh="cargarDatos"
      />
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { Settings, UtensilsCrossed, Tags, CreditCard, Grid3x3, ArrowLeft } from 'lucide-vue-next';
import api from '../api';
import MenuEditor from './MenuEditor.vue';
import CategoriesEditor from './CategoriesEditor.vue';
import PaymentMethodsEditor from './PaymentMethodsEditor.vue';
import ConfigEditor from './ConfigEditor.vue';
import TablesEditor from './TablesEditor.vue';
const activeTab = ref('menu');
const menuItems = ref([]);
const categories = ref([]);
const paymentMethods = ref([]);
const config = ref({});
const tables = ref([]);
const cargarDatos = async () => {
  try {
    const [menuRes, catRes, pagosRes, configRes, mesasRes] = await Promise.all([
      api.getMenu({ params: { include_hidden: true } }),
      api.getCategories(),
      api.getPaymentMethods(),
      api.getConfig(),
      api.getMesas()
    ]);
    
    menuItems.value = menuRes.data;
    categories.value = catRes.data;
    paymentMethods.value = pagosRes.data;
    config.value = configRes.data;
    tables.value = mesasRes.data;
  } catch (err) {
    console.error('Error:', err);
  }
};
onMounted(() => {
  cargarDatos();
});
</script>
<style src="../assets/styles/EditorPanelHeader.css" scoped></style>