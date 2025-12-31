<template>
  <div class="tables-editor">
    <div class="card form-card">
      <div class="card-header">
        <div class="section-title">
          <Plus :size="20" />
          <h3>{{ $t('editor.tables.new_table') }}</h3>
        </div>
      </div>
      <form @submit.prevent="crearMesa" class="table-form">
        <div class="form-row">
          <div class="form-group">
            <label>{{ $t('editor.tables.number') }}</label>
            <input v-model.number="newMesa.numero" type="number" :placeholder="$t('editor.tables.number')" required />
          </div>
          <div class="form-group">
            <label>{{ $t('editor.tables.capacity') }}</label>
            <input v-model.number="newMesa.capacidad" type="number" :placeholder="$t('editor.tables.capacity')" required />
          </div>
          <div class="form-group">
            <label>&nbsp;</label>
            <button type="submit" class="btn-submit">{{ $t('common.add') }}</button>
          </div>
        </div>
      </form>
    </div>

        <div class="mesas-grid">
          <div v-for="mesa in tables" :key="mesa.id" class="mesa-card">
            <div class="mesa-header">
              <Grid3x3 :size="24" class="mesa-icon" />
            </div>
            <div class="mesa-number">{{ $t('common.table') }} {{ mesa.numero }}</div>
            <div class="mesa-capacity">
              <Users :size="14" />
              {{ mesa.capacidad }} {{ $t('common.people') }}
            </div>
            
            <!-- Blocking Toggle -->
            <div class="mesa-blocking">
              <label class="switch small">
                <input type="checkbox" :checked="mesa.is_blockable" @change="toggleBlockableMesa(mesa)">
                <span class="slider round"></span>
              </label>
              <span class="toggle-label">
                <component :is="mesa.is_blockable ? Lock : Unlock" :size="12" />
                {{ mesa.is_blockable ? $t('editor.tables.blocked') : $t('editor.tables.free') }}
              </span>
            </div>

            <button @click="eliminarMesa(mesa.id)" class="btn-icon delete-mesa" :title="$t('common.delete')">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Plus, Grid3x3, Users, Lock, Unlock, Trash2 } from 'lucide-vue-next';
import api from '../api';
const { t } = useI18n();
const props = defineProps({
  tables: Array
});
const emit = defineEmits(['refresh']);
const editingMesa = ref(null);
const newMesa = ref({ numero: '', capacidad: 4 });
const crearMesa = async () => {
  try {
    await api.crearMesa(newMesa.value.numero, newMesa.value.capacidad);
    newMesa.value = { numero: '', capacidad: 4 };
    emit('refresh');
  } catch (err) {
    console.error('Error:', err);
    alert('Error al crear mesa');
  }
};
const editarMesa = (mesa) => {
  editingMesa.value = mesa;
  newMesa.value = { ...mesa };
};
const eliminarMesa = async (id) => {
  if (!confirm('¿Eliminar esta mesa?')) return;
  try {
    await api.deleteMesa(id);
    emit('refresh');
  } catch (err) {
    console.error('Error:', err);
  }
};
const toggleBlockableMesa = async (mesa) => {
  try {
    await api.updateMesa(mesa.id, {
      ...mesa,
      is_blockable: !mesa.is_blockable
    });
    emit('refresh');
  } catch (err) {
    console.error('Error:', err);
  }
};

</script>

<style src="../assets/styles/TablesEditor.css" scoped></style>