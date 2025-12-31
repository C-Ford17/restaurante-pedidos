<template>
  <div class="categories-editor">
          <div class="card form-card">
              <div class="card-header">
                <div class="section-title">
                  <Tags :size="20" />
                  <h3>{{ $t('editor.tabs.categories') }}</h3>
                </div>
              </div>
              <form @submit.prevent="crearCategoria" class="category-form">
                  <div class="form-row">
                      <div class="form-group">
                        <label>{{ $t('editor.form.name') }}</label>
                        <div class="input-with-icon">
                          <Type :size="16" />
                          <input v-model="newCategory.name" :placeholder="$t('editor.placeholders.category')" required />
                        </div>
                      </div>
                      <div class="form-group">
                        <label>{{ $t('editor.headers.visual_order') }}</label>
                        <div class="input-with-icon">
                          <ListOrdered :size="16" />
                          <input v-model.number="newCategory.display_order" type="number" placeholder="0" />
                        </div>
                      </div>
                      <div class="form-group">
                         <label>&nbsp;</label>
                         <button type="submit" class="btn-submit">
                            <Plus :size="18" />
                            {{ $t('common.add') }}
                         </button>
                      </div>
                  </div>
              </form>
          </div>

          <div class="categories-list">
              <div class="list-header">
                <div class="col-name">{{ $t('editor.headers.category_name') }}</div>
                <div class="col-order">{{ $t('editor.headers.visual_order') }}</div>
                <div class="col-actions"></div>
              </div>
              <div v-for="cat in categories" :key="cat.id" class="list-item">
                  <div class="col-name">
                    <input v-model="cat.name" class="editable-input" @change="actualizarCategoria(cat)" />
                  </div>
                  <div class="col-order">
                    <input v-model.number="cat.display_order" type="number" class="editable-input center" @change="actualizarCategoria(cat)" />
                  </div>
                  <div class="col-actions">
                    <button @click="eliminarCategoria(cat.id)" class="btn-icon delete" :title="$t('common.delete')">
                      <Trash2 :size="18" />
                    </button>
                  </div>
              </div>
          </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Tags, Plus, Trash2, Type, ListOrdered } from 'lucide-vue-next';
import api from '../api';
const { t } = useI18n();
const props = defineProps({
  categories: Array
});
const emit = defineEmits(['refresh']);
const newCategory = ref({ name: '', order: 0 });
const editingCategory = ref(null);
const crearCategoria = async () => {
  try {
    await api.createCategory(newCategory.value);
    newCategory.value = { name: '', order: 0 };
    emit('refresh');
  } catch (err) {
    console.error('Error:', err);
    alert('Error al crear categoría');
  }
};
const actualizarCategoria = async (cat) => {
  try {
    await api.updateCategory(cat.id, cat);
    emit('refresh');
  } catch (err) {
    console.error('Error:', err);
  }
};
const editarCategoria = (cat) => {
  editingCategory.value = { ...cat };
};
const guardarEdicionCategoria = async () => {
  try {
    await api.updateCategory(editingCategory.value.id, editingCategory.value);
    editingCategory.value = null;
    emit('refresh');
  } catch (err) {
    console.error('Error:', err);
  }
};
const cancelarEdicionCategoria = () => {
  editingCategory.value = null;
};
const eliminarCategoria = async (id) => {
  if (!confirm('¿Eliminar esta categoría?')) return;
  try {
    await api.deleteCategory(id);
    emit('refresh');
  } catch (err) {
    console.error('Error:', err);
  }
};
</script>

<style src="../assets/styles/CategoriesEditor.css" scoped></style>