<template>
  <div class="payment-methods-editor">
          <div class="card form-card">
              <div class="card-header">
                <div class="section-title">
                  <CreditCard :size="20" />
                  <h3>{{ $t('editor.tabs.payments') }}</h3>
                </div>
              </div>
              <form @submit.prevent="crearMetodoPago" class="payment-form">
                  <div class="form-row">
                      <div class="form-group">
                        <label>{{ $t('editor.headers.internal_code') }}</label>
                        <div class="input-with-icon">
                          <Code :size="16" />
                          <input v-model="newPaymentMethod.name" placeholder="ej: daviplata" required />
                        </div>
                      </div>
                      <div class="form-group">
                        <label>{{ $t('editor.headers.visible_name') }}</label>
                        <div class="input-with-icon">
                           <Type :size="16" />
                          <input v-model="newPaymentMethod.label" placeholder="ej: Daviplata" required />
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

          <div class="payments-list">
               <div class="list-header">
                <div class="col-name">{{ $t('editor.headers.visible_name') }}</div>
                <div class="col-code">{{ $t('editor.headers.internal_code') }}</div>
                <div class="col-status">{{ $t('editor.headers.status') }}</div>
                <div class="col-actions"></div>
              </div>
              <div v-for="pm in paymentMethods" :key="pm.id" class="list-item">
                  <div class="col-name">
                      <div class="input-with-icon small">
                        <component :is="pm.name === 'cash' ? Banknote : CreditCard" :size="14" />
                        <input v-model="pm.label" class="editable-input" @change="actualizarMetodoPago(pm)" />
                      </div>
                  </div>
                  <div class="col-code">
                      <code>{{ pm.name }}</code>
                  </div>
                  <div class="col-status">
                      <label class="switch small">
                          <input type="checkbox" v-model="pm.active" @change="actualizarMetodoPago(pm)">
                          <span class="slider round"></span>
                      </label>
                  </div>
                  <div class="col-actions">
                      <button v-if="pm.name !== 'cash'" @click="eliminarMetodoPago(pm.id)" class="btn-icon delete" :title="$t('common.delete')">
                        <Trash2 :size="18" />
                      </button>
                  </div>
              </div>
          </div>
          <p class="info-text">
            <Info :size="14" />
            <strong>{{ $t('editor.headers.status') }}:</strong> {{ $t('editor.config.payment_method_status_help') }}
          </p>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { CreditCard, Plus, Trash2, Code, Type, Banknote, Info } from 'lucide-vue-next';
import api from '../api';
const { t } = useI18n();
const props = defineProps({
  paymentMethods: Array
});
const emit = defineEmits(['refresh']);
const newPaymentMethod = ref({ name: '', is_active: true });
const editingPaymentMethod = ref(null);
const crearMetodoPago = async () => {
  try {
    await api.createPaymentMethod(newPaymentMethod.value);
    newPaymentMethod.value = { name: '', is_active: true };
    emit('refresh');
  } catch (err) {
    console.error('Error:', err);
    alert('Error al crear método de pago');
  }
};
const actualizarMetodoPago = async (pm) => {
  try {
    await api.updatePaymentMethod(pm.id, pm);
    emit('refresh');
  } catch (err) {
    console.error('Error:', err);
  }
};
const editarMetodoPago = (metodo) => {
  editingPaymentMethod.value = { ...metodo };
};
const guardarEdicionMetodoPago = async () => {
  try {
    await api.updatePaymentMethod(editingPaymentMethod.value.id, editingPaymentMethod.value);
    editingPaymentMethod.value = null;
    emit('refresh');
  } catch (err) {
    console.error('Error:', err);
  }
};
const cancelarEdicionMetodoPago = () => {
  editingPaymentMethod.value = null;
};
const eliminarMetodoPago = async (id) => {
  if (!confirm('¿Eliminar este método de pago?')) return;
  try {
    await api.deletePaymentMethod(id);
    emit('refresh');
  } catch (err) {
    console.error('Error:', err);
  }
};
const toggleMetodoPago = async (metodo) => {
  try {
    await api.updatePaymentMethod(metodo.id, {
      ...metodo,
      is_active: !metodo.is_active
    });
    emit('refresh');
  } catch (err) {
    console.error('Error:', err);
  }
};
</script>

<style src="../assets/styles/PaymentMethodsEditor.css" scoped></style>