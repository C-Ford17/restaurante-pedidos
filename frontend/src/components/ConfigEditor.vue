<template>
  <div class="config-editor">
        <div class="card config-card">
          <div class="card-header">
            <div class="section-title">
              <Settings :size="20" />
              <h3>{{ $t('editor.config.title') }}</h3>
            </div>
          </div>

          <!-- Basic Info Section -->
          <div class="config-section">
            <div class="form-grid">
              <div class="form-group">
                <label>{{ $t('editor.config.name') }}</label>
                <div class="input-with-icon">
                  <Type :size="16" />
                  <input v-model="localConfig.nombre" />
                </div>
              </div>
              <div class="form-group">
                <label>{{ $t('editor.config.short_name') }} <small>(Max 12)</small></label>
                <div class="input-with-icon">
                  <Hash :size="16" />
                  <input v-model="localConfig.nombre_corto" type="text" placeholder="Ej: SierraNevada" maxlength="15" />
                </div>
              </div>
              <div class="form-group full-width">
                <label>{{ $t('editor.config.slogan') }}</label>
                <div class="input-with-icon">
                  <MessageSquare :size="16" />
                   <input v-model="localConfig.subtitulo" />
                </div>
              </div>
              <div class="form-group checkbox-group">
                <label class="checkbox-card">
                  <input type="checkbox" v-model="localConfig.ocultarTextoPortada" />
                  <span>{{ $t('editor.config.hide_text') }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Images Section -->
          <div class="config-section">
             <div class="section-subtitle">
                <Image :size="18" />
                <h4>{{ $t('editor.config.cover_img') }}</h4>
             </div>
             <div class="image-uploader">
                <div class="url-input">
                  <input v-model="localConfig.imagenPortada" type="text" placeholder="https://..." />
                </div>
                <div class="file-upload-btn">
                  <label>
                    <Upload :size="16" />
                    {{ $t('common.upload') }}
                    <input type="file" @change="e => subirImagenConfig(e, 'imagenPortada')" accept="image/*" />
                  </label>
                </div>
             </div>
             <div v-if="localConfig.imagenPortada" class="img-preview-large">
                <img :src="localConfig.imagenPortada" />
                <button @click="localConfig.imagenPortada = ''" class="btn-icon delete-overlay">
                  <Trash2 :size="16" />
                </button>
             </div>

             <div class="section-subtitle mt-4">
                <Image :size="18" />
                <h4>{{ $t('editor.config.menu_bg') }}</h4>
             </div>
             <div class="image-uploader">
                <div class="url-input">
                   <input v-model="localConfig.imagenFondoMenu" type="text" placeholder="https://..." />
                </div>
                <div class="file-upload-btn">
                   <label>
                      <Upload :size="16" />
                      {{ $t('common.upload') }}
                      <input type="file" @change="e => subirImagenConfig(e, 'imagenFondoMenu')" accept="image/*" />
                   </label>
                </div>
             </div>
             <div v-if="localConfig.imagenFondoMenu" class="img-preview-large">
                <img :src="localConfig.imagenFondoMenu" />
                <button @click="localConfig.imagenFondoMenu = ''" class="btn-icon delete-overlay">
                  <Trash2 :size="16" />
                </button>
             </div>
          </div>

          <!-- Tip Section -->
          <div class="config-section">
            <div class="section-subtitle">
               <Coins :size="18" />
               <h4>{{ $t('editor.config.tip_percentage') }}</h4>
            </div>
            <div class="tip-control">
              <div class="input-with-icon" style="width: 120px;">
                <Percent :size="16" />
                <input
                  v-model.number="porcentajePropina"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="10"
                />
              </div>
              <p class="help-text">
                {{ $t('editor.config.tip_help') }}
              </p>
            </div>
          </div>

          <!-- Colors Section -->
          <div class="config-section">
            <div class="section-subtitle">
               <Palette :size="18" />
               <h4>{{ $t('editor.config.colors_title') }}</h4>
            </div>
            <div class="colors-grid">
              <div class="color-input-group">
                <label>{{ $t('editor.config.colors_primary') }}</label>
                <div class="color-picker-wrapper">
                  <input v-model="localConfig.color_primario" type="color" />
                  <input v-model="localConfig.color_primario" type="text" class="color-hex" />
                </div>
              </div>
              <div class="color-input-group">
                <label>{{ $t('editor.config.colors_secondary') }}</label>
                <div class="color-picker-wrapper">
                  <input v-model="localConfig.color_secundario" type="color" />
                  <input v-model="localConfig.color_secundario" type="text" class="color-hex" />
                </div>
              </div>
            </div>
          </div>

          <!-- Icons Section -->
          <div class="config-section">
            <div class="section-subtitle">
               <Smartphone :size="18" />
               <h4>{{ $t('editor.config.icons_title') }}</h4>
            </div>
             <div class="icons-grid">
               <!-- Loop for icons could be optimized, but explicit for now -->
               <div class="icon-upload-item">
                 <label>Favicon (32x32)</label>
                 <div class="icon-preview-box" :class="{ empty: !localConfig.favicon_url }">
                    <img v-if="localConfig.favicon_url" :src="localConfig.favicon_url" />
                    <Upload v-else :size="24" class="upload-icon" />
                    <input type="file" @change="(e) => subirIcono(e, 'favicon_url')" accept="image/*" class="file-input-hidden" />
                    <button v-if="localConfig.favicon_url" @click.stop="localConfig.favicon_url = ''" class="btn-icon delete-icon">
                      <Trash2 :size="14" />
                    </button>
                 </div>
               </div>
               
               <div class="icon-upload-item">
                 <label>App Icon (192)</label>
                 <div class="icon-preview-box" :class="{ empty: !localConfig.icon_192_url }">
                    <img v-if="localConfig.icon_192_url" :src="localConfig.icon_192_url" />
                    <Upload v-else :size="24" class="upload-icon" />
                    <input type="file" @change="(e) => subirIcono(e, 'icon_192_url')" accept="image/*" class="file-input-hidden" />
                     <button v-if="localConfig.icon_192_url" @click.stop="localConfig.icon_192_url = ''" class="btn-icon delete-icon">
                      <Trash2 :size="14" />
                    </button>
                 </div>
               </div>

               <div class="icon-upload-item">
                 <label>Big Icon (512)</label>
                 <div class="icon-preview-box" :class="{ empty: !localConfig.icon_512_url }">
                    <img v-if="localConfig.icon_512_url" :src="localConfig.icon_512_url" />
                    <Upload v-else :size="24" class="upload-icon" />
                    <input type="file" @change="(e) => subirIcono(e, 'icon_512_url')" accept="image/*" class="file-input-hidden" />
                     <button v-if="localConfig.icon_512_url" @click.stop="localConfig.icon_512_url = ''" class="btn-icon delete-icon">
                      <Trash2 :size="14" />
                    </button>
                 </div>
               </div>

                <div class="icon-upload-item">
                 <label>Apple Icon</label>
                 <div class="icon-preview-box" :class="{ empty: !localConfig.apple_touch_icon_url }">
                    <img v-if="localConfig.apple_touch_icon_url" :src="localConfig.apple_touch_icon_url" />
                    <Upload v-else :size="24" class="upload-icon" />
                    <input type="file" @change="(e) => subirIcono(e, 'apple_touch_icon_url')" accept="image/*" class="file-input-hidden" />
                     <button v-if="localConfig.apple_touch_icon_url" @click.stop="localConfig.apple_touch_icon_url = ''" class="btn-icon delete-icon">
                      <Trash2 :size="14" />
                    </button>
                 </div>
               </div>
             </div>
             <p class="help-text mt-2">
              💡 {{ $t('editor.config.icons_help') }}
            </p>
          </div>
          
          <div class="actions-sticky-footer">
             <button @click="guardarConfig" class="btn-submit big glow-effect" :disabled="guardando">
              <Save :size="20" v-if="!guardando" />
              <div v-else class="spinner"></div>
              <span>{{ guardando ? $t('common.saving') : $t('common.save_changes') }}</span>
            </button>
          </div>

          <div class="qr-section">
             <div class="section-subtitle center">
                <QrCode :size="24" />
                <h4>{{ $t('editor.qr_title') }}</h4>
             </div>
             <div class="qr-content-wrapper">
               <div class="qr-card">
                  <GeneradorQR :valor="urlMenuDinamica" :size="200" :mostrarDescarga="false" ref="qrComponentRef" />
               </div>
               <div class="qr-actions">
                  <a :href="urlMenuDinamica" target="_blank" class="qr-link">
                    <ExternalLink :size="16" />
                    {{ urlMenuDinamica }}
                  </a>
                  <button @click="descargarQR" class="btn-outline">
                    <Download :size="18" />
                    Descargar QR
                  </button>
               </div>
             </div>
          </div>
        </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Settings, Type, Hash, MessageSquare, Image, Upload, Trash2, Coins, Percent, Palette, Smartphone, Save, QrCode, Download, ExternalLink } from 'lucide-vue-next';
import api from '../api';
import GeneradorQR from './GeneradorQR.vue';
const { t } = useI18n();
const props = defineProps({
  config: Object
});
const emit = defineEmits(['refresh']);
const localConfig = ref({ ...props.config });
const qrComponentRef = ref(null);
const porcentajePropina = ref(props.config.tip_percentage || 10);
const guardando = ref(false);
const urlMenuDinamica = computed(() => {
  return `${window.location.origin}/menu`;
});
const guardarConfig = async () => {
  guardando.value = true;
  try {
    await api.saveConfig({
      ...localConfig.value,
      tip_percentage: porcentajePropina.value
    });
    emit('refresh');
    alert('Configuración guardada');
  } catch (err) {
    console.error('Error:', err);
    alert('Error al guardar');
  } finally {
    guardando.value = false;
  }
};
const subirImagenConfig = async (event, campo) => {
  const file = event.target.files[0];
  if (!file) return;
  
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const res = await api.uploadMenuImage(formData);
    localConfig.value[campo] = res.data.url;
  } catch (err) {
    console.error('Error:', err);
    alert('Error subiendo imagen');
  }
};
const subirIcono = async (event, campo) => {
  const file = event.target.files[0];
  if (!file) return;
  
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const res = await api.uploadMenuImage(formData);
    localConfig.value[campo] = res.data.url;
  } catch (err) {
    console.error('Error:', err);
    alert('Error subiendo icono');
  }
};

const descargarQR = () => {
    if (qrComponentRef.value && qrComponentRef.value.qrSrc) {
        const link = document.createElement('a');
        link.download = `menu-qr-${localConfig.value.nombre_corto || 'restaurant'}.png`;
        link.href = qrComponentRef.value.qrSrc;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert('No se pudo generar la imagen del QR.');
    }
};
</script>
<style src="../assets/styles/ConfigEditor.css" scoped></style>