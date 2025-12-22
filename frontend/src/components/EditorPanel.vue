<template>
  <div class="editor-panel">
    <!-- HEADER Y NAVEGACIÓN -->
    <div class="editor-header no-print">
      <div class="header-top">
        <h2>🛠️ Editor</h2>
        <button @click="$emit('volver')" class="btn-volver" title="Volver al Panel">
          <span class="icon">⬅️</span> <span class="text">Volver</span>
        </button>
      </div>

      <div class="tabs-container">
        <button 
          :class="['tab-btn', { active: activeTab === 'menu' }]" 
          @click="activeTab = 'menu'"
          title="Menú"
        >
          <span class="tab-icon">🍔</span>
          <span class="tab-text">Menú</span>
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'config' }]" 
          @click="activeTab = 'config'"
          title="Configuración"
        >
          <span class="tab-icon">⚙️</span>
          <span class="tab-text">Configuración</span>
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'mesas' }]" 
          @click="activeTab = 'mesas'"
          title="Mesas"
        >
          <span class="tab-icon">🪑</span>
          <span class="tab-text">Mesas</span>
        </button>
      </div>
    </div>

    <!-- CONTENIDO PRINCIPAL -->
    <div class="panel-body">
      
      <!-- TAB: MENÚ -->
      <div v-if="activeTab === 'menu'" class="tab-content fade-in">
        <!-- Botón Ver Menú -->
        <div class="menu-actions no-print">
          <a :href="urlMenuDinamica" target="_blank" class="btn-ver-menu">
            <span class="icon">📄</span> 
            Ver Menú Digital / PDF
            <span class="external-icon">↗</span>
          </a>
        </div>

        <!-- Formulario Nuevo Item -->
        <div class="card form-card">
          <div class="card-header">
            <h3>➕ Nuevo Plato</h3>
          </div>
          <form @submit.prevent="crearItem" class="item-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Nombre</label>
                <input v-model="newItem.nombre" placeholder="Ej: Hamburguesa Doble" required />
              </div>
              <div class="form-group">
                <label>Categoría</label>
                <input v-model="newItem.categoria" placeholder="Ej: Platos Fuertes" required />
              </div>
              <div class="form-group">
                <label>Precio ($)</label>
                <input v-model.number="newItem.precio" type="number" step="0.01" placeholder="0.00" required />
              </div>
              <div class="form-group">
                <label>Tiempo (min)</label>
                <input v-model.number="newItem.tiempo_preparacion_min" type="number" placeholder="15" />
              </div>
            </div>
            
            <div class="form-group">
              <label>Descripción</label>
              <textarea v-model="newItem.descripcion" placeholder="Ingredientes, alérgenos..." rows="2"></textarea>
            </div>
            
            <!-- ✅ NUEVO: Subir imagen del plato -->
            <div class="form-group">
              <label>Imagen del Plato</label>
              <input type="file" @change="subirImagenItem" accept="image/*" />
              <div v-if="newItem.image_url" class="img-preview-small">
                <img :src="newItem.image_url" alt="Preview" />
                <button @click="newItem.image_url = ''" type="button" class="btn-text-danger">
                  Eliminar
                </button>
              </div>
              <small v-if="subiendoImagen" class="text-info">⏳ Subiendo imagen...</small>
            </div>
            
            <div class="options-grid">
              <label class="checkbox-card">
                <input type="checkbox" v-model="newItem.usa_inventario" />
                <span>📦 Control Stock</span>
              </label>
              <label class="checkbox-card highlight">
                <input type="checkbox" v-model="newItem.es_directo" />
                <span>🍹 Servir Directo</span>
              </label>
            </div>

            <!-- Campos de Inventario (Condicional) -->
            <div v-if="newItem.usa_inventario" class="inventory-subform">
              <div class="form-grid small-grid">
                <div class="form-group">
                  <label>Stock Actual</label>
                  <input v-model.number="newItem.stock_actual" type="number" min="0" />
                </div>
                <div class="form-group">
                  <label>Stock Mínimo</label>
                  <input v-model.number="newItem.stock_minimo" type="number" min="0" />
                </div>
              </div>
            </div>
            
            <button type="submit" class="btn-submit" :disabled="loading">
              {{ loading ? 'Guardando...' : '✨ Agregar Item' }}
            </button>
          </form>
        </div>

        <!-- Lista de Items -->
        <div class="menu-list">
          <div v-for="(items, categoria) in menuPorCategoria" :key="categoria" class="category-group">
            <h3 class="category-title">{{ categoria }} <span class="count">{{ items.length }}</span></h3>
            <div class="items-grid">
              <div v-for="item in items" :key="item.id" class="item-card">
                <div class="item-card-header">
                  <input v-model="item.nombre" class="edit-input title-input" @change="actualizarItem(item)" />
                  <button @click="eliminarItem(item.id)" class="btn-icon delete" title="Eliminar">🗑️</button>
                </div>
                
                <div class="item-card-body">
                  <textarea 
                    v-model="item.descripcion" 
                    class="edit-input desc-input" 
                    @change="actualizarItem(item)" 
                    rows="2"
                    placeholder="Agrega una descripción..." 
                  ></textarea>
                  
                  <!-- ✅ NUEVO: Imagen del plato -->
                  <div style="margin: 8px 0; padding: 8px; background: #f9fafb; border-radius: 6px;">
                    <label style="font-size: 12px; font-weight: 600; color: #4b5563; display: block; margin-bottom: 4px;">🖼️ Imagen:</label>
                    <input 
                      type="file" 
                      @change="(e) => subirImagenItemExistente(e, item)" 
                      accept="image/*" 
                      style="font-size: 11px; width: 100%;"
                    />
                    <div v-if="item.image_url" class="img-preview-small" style="margin-top: 8px;">
                      <img :src="item.image_url" alt="Preview" />
                      <button 
                        @click="eliminarImagenItem(item)" 
                        type="button" 
                        class="btn-text-danger"
                      >
                        Eliminar
                      </button>
                    </div>
                    <small v-if="itemEditandoImagen === item.id" class="text-info">⏳ Subiendo...</small>
                  </div>

                  <div class="price-time-row">
                    <div class="input-wrapper symbol">
                      <input v-model.number="item.precio" type="number" class="edit-input" @change="actualizarItem(item)" />
                    </div>
                    <div class="input-wrapper suffix">
                      <input v-model.number="item.tiempo_preparacion_min" type="number" class="edit-input" @change="actualizarItem(item)" />
                    </div>
                  </div>

                  <!-- Badges y Checkbox Rápidos -->
                  <div class="badges-row">
                    <label class="badge-checkbox" :class="{ active: item.es_directo }">
                      <input type="checkbox" v-model="item.es_directo" @change="actualizarItem(item)" />
                      🍹 Directo
                    </label>
                    
                    <label class="badge-checkbox" :class="{ active: item.usa_inventario }">
                      <input type="checkbox" v-model="item.usa_inventario" @change="actualizarItem(item)" />
                      📦 Stock
                    </label>
                  </div>

                  <!-- Control de Stock Rápido -->
                  <div v-if="item.usa_inventario" class="stock-control">
                    <input v-model.number="item.stock_actual" type="number" class="stock-input" @change="actualizarItem(item)" placeholder="#" />
                    <select v-model="item.estado_inventario" class="stock-select" @change="actualizarItem(item)">
                      <option value="disponible">✅ Disp</option>
                      <option value="poco_stock">⚠️ Bajo</option>
                      <option value="no_disponible">❌ Agotado</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB: CONFIGURACIÓN -->
      <div v-if="activeTab === 'config'" class="tab-content fade-in">
        <div class="card config-card">
          <div class="card-header">
            <h3>⚙️ Ajustes Generales</h3>
          </div>
          <div class="form-group">
            <label>Nombre Restaurante</label>
            <input v-model="config.nombre" />
          </div>

          <!-- ✅ Campo Nombre Corto -->
          <div class="form-group">
            <label>Nombre Corto (App Móvil) <small>(Máx 12 letras)</small></label>
            <input v-model="config.nombre_corto" type="text" placeholder="Ej: SierraNevada" maxlength="15" />
          </div>
          <div class="form-group">
            <label>Slogan / Subtítulo</label>
            <input v-model="config.subtitulo" />
          </div>
          
          <div class="options-grid" style="margin-top: 16px;">
             <label class="checkbox-card">
                <input type="checkbox" v-model="config.ocultarTextoPortada" />
                <span>Ocultar texto en portada</span>
              </label>
          </div>

          <div class="form-group" style="margin-top: 16px;">
             <label>Imagen Portada</label>
             <input type="file" @change="e => procesarImagen(e, 'imagenPortada')" accept="image/*" />
             <div v-if="config.imagenPortada" class="img-preview">
                <img :src="config.imagenPortada" />
                <button @click="config.imagenPortada = ''" class="btn-text-danger">Eliminar</button>
             </div>
          </div>

          <div class="form-group">
             <label>Fondo Menú</label>
             <input type="file" @change="e => procesarImagen(e, 'imagenFondoMenu')" accept="image/*" />
             <div v-if="config.imagenFondoMenu" class="img-preview">
                <img :src="config.imagenFondoMenu" />
                <button @click="config.imagenFondoMenu = ''" class="btn-text-danger">Eliminar</button>
             </div>
          </div>

          <!-- ✅ NUEVO: Configuración de Propina -->
          <div class="form-group" style="margin-top: 24px; border-top: 2px solid #e5e7eb; padding-top: 24px;">
            <label>💰 Porcentaje de Propina Sugerida (%)</label>
            <div style="display: flex; align-items: center; gap: 12px;">
              <input
                v-model.number="porcentajePropina"
                type="number"
                min="0"
                max="100"
                step="1"
                placeholder="10"
                style="width: 100px;"
              />
              <span style="color: #6b7280;">%</span>
              <span style="color: #6b7280; font-size: 14px;">
                (Actualmente: {{ porcentajePropina }}%)
              </span>
            </div>
            <p style="font-size: 13px; color: #6b7280; margin-top: 8px;">
              El sistema sugerirá este % como propina
            </p>
          </div>

          <!-- ✅ NUEVO: Colores del tema -->
          <div style="margin-top: 24px; border-top: 2px solid #e5e7eb; padding-top: 24px;">
            <h4 style="margin: 0 0 16px 0; color: #374151; font-size: 16px;">
              🎨 Colores del Sistema
            </h4>
            <div class="form-grid">
              <div class="form-group">
                <label>Color Primario (Botones, Headers)</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <input v-model="config.color_primario" type="color" style="width: 60px; height: 40px; cursor: pointer; border-radius: 6px; border: 1px solid #e5e7eb;" />
                  <input v-model="config.color_primario" type="text" placeholder="#667eea" style="flex: 1;" />
                </div>
              </div>
              
              <div class="form-group">
                <label>Color Secundario (Fondos, Acentos)</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <input v-model="config.color_secundario" type="color" style="width: 60px; height: 40px; cursor: pointer; border-radius: 6px; border: 1px solid #e5e7eb;" />
                  <input v-model="config.color_secundario" type="text" placeholder="#764ba2" style="flex: 1;" />
                </div>
              </div>
            </div>
          </div>

          <!-- ✅ NUEVO: Iconos de la Aplicación -->
          <div style="margin-top: 24px; border-top: 2px solid #e5e7eb; padding-top: 24px;">
            <h4 style="margin: 0 0 16px 0; color: #374151; font-size: 16px;">
              📱 Iconos de la Aplicación
            </h4>
            
            <div class="form-grid">
              <!-- Favicon -->
              <div class="form-group">
                <label>Favicon (32x32)</label>
                <input type="file" @change="(e) => subirIcono(e, 'favicon_url')" accept="image/*" />
                <div v-if="config.favicon_url" class="img-preview-small" style="margin-top: 8px;">
                  <img :src="config.favicon_url" alt="Favicon" style="width: 32px; height: 32px; object-fit: contain;" />
                  <button @click="config.favicon_url = ''" type="button" class="btn-text-danger">Eliminar</button>
                </div>
              </div>

              <!-- PWA 192 -->
              <div class="form-group">
                <label>Icono App (192x192)</label>
                <input type="file" @change="(e) => subirIcono(e, 'icon_192_url')" accept="image/*" />
                <div v-if="config.icon_192_url" class="img-preview-small" style="margin-top: 8px;">
                  <img :src="config.icon_192_url" alt="Icon 192" style="width: 48px; height: 48px; object-fit: contain;" />
                  <button @click="config.icon_192_url = ''" type="button" class="btn-text-danger">Eliminar</button>
                </div>
              </div>

              <!-- PWA 512 -->
              <div class="form-group">
                <label>Icono Grande (512x512)</label>
                <input type="file" @change="(e) => subirIcono(e, 'icon_512_url')" accept="image/*" />
                <div v-if="config.icon_512_url" class="img-preview-small" style="margin-top: 8px;">
                  <img :src="config.icon_512_url" alt="Icon 512" style="width: 48px; height: 48px; object-fit: contain;" />
                  <button @click="config.icon_512_url = ''" type="button" class="btn-text-danger">Eliminar</button>
                </div>
              </div>

              <!-- Apple Touch -->
              <div class="form-group">
                <label>Icono Apple (180x180)</label>
                <input type="file" @change="(e) => subirIcono(e, 'apple_touch_icon_url')" accept="image/*" />
                <div v-if="config.apple_touch_icon_url" class="img-preview-small" style="margin-top: 8px;">
                  <img :src="config.apple_touch_icon_url" alt="Apple Icon" style="width: 48px; height: 48px; object-fit: contain;" />
                  <button @click="config.apple_touch_icon_url = ''" type="button" class="btn-text-danger">Eliminar</button>
                </div>
              </div>
            </div>
            <p style="font-size: 12px; color: #6b7280; margin-top: 12px;">
              💡 Estos iconos se usarán para la instalación PWA y marcadores del navegador.
            </p>
          </div>
          
          <button @click="guardarConfig" class="btn-submit" :disabled="guardando" style="margin-top: 24px;">
            {{ guardando ? 'Guardando...' : '💾 Guardar Cambios' }}
          </button>

          <div class="qr-preview" style="margin-top: 32px; text-align: center;">
             <h4>QR del Menú</h4>
             <GeneradorQR :valor="urlMenuDinamica" :size="180" />
             <p style="margin-top: 8px; font-size: 12px; color: #666;">{{ urlMenuDinamica }}</p>
          </div>
        </div>
      </div>

      <!-- TAB: MESAS -->
      <div v-if="activeTab === 'mesas'" class="tab-content fade-in">
        <div class="card form-card">
          <div class="card-header">
            <h3>➕ Nueva Mesa</h3>
          </div>
          <form @submit.prevent="crearMesa" class="inline-form">
            <div class="form-grid" style="grid-template-columns: 1fr 1fr auto;">
              <input v-model.number="newMesa.numero" type="number" placeholder="# Mesa" required />
              <input v-model.number="newMesa.capacidad" type="number" placeholder="Capacidad" required />
              <button type="submit" class="btn-submit small" style="width: auto;">Agregar</button>
            </div>
          </form>
        </div>

        <div class="mesas-grid">
          <div v-for="mesa in mesas" :key="mesa.id" class="mesa-card">
            <div class="mesa-number">Mesa {{ mesa.numero }}</div>
            <div class="mesa-capacity">👤 {{ mesa.capacidad }} pers.</div>
            <button @click="eliminarMesa(mesa.id)" class="btn-icon delete-mesa" title="Eliminar">✕</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../api';
import GeneradorQR from './GeneradorQR.vue';

const emit = defineEmits(['volver']);

const activeTab = ref('menu');
const loading = ref(false);
// ✅ URL DINÁMICA: Detecta si es localhost o vercel
const urlMenuDinamica = computed(() => {
  const origen = window.location.origin;
  return `${origen}/menu`; 
});



// Estado Menú
const menuItems = ref([]);
const newItem = ref({ 
  nombre: '',
  descripcion: '',
  precio: 0,
  categoria: '',
  tiempo_preparacion_min: 15,
  usa_inventario: false,
  stock_actual: 0,
  stock_minimo: 0,
  unidad_medida: 'unidades',
  es_directo: false,
  image_url: '' // ✅ NUEVO
});

// Estado Configuración
const config = ref({
  nombre: 'Restaurante Sierra Nevada',
  nombre_corto: 'Restaurante', // ✅ NUEVO
  subtitulo: 'Menú Digital',
  imagenPortada: '',
  imagenFondoMenu: '',
  ocultarTextoPortada: false,
  color_primario: '#667eea',
  color_secundario: '#764ba2'
});

// ✅ NUEVO: Porcentaje de propina
const porcentajePropina = ref(10);

// ✅ NUEVO: Estado de carga de imagen
const subiendoImagen = ref(false);
const itemEditandoImagen = ref(null); // ID del item cuya imagen se está subiendo

// Estado Mesas
const mesas = ref([]);
const newMesa = ref({ numero: '', capacidad: 4 });

// Computed: Agrupar menú por categoría
const menuPorCategoria = computed(() => {
  const grupos = {};
  menuItems.value.forEach(item => {
    if (!grupos[item.categoria]) grupos[item.categoria] = [];
    grupos[item.categoria].push(item);
  });
  return grupos;
});

// --- MÉTODOS MENÚ ---
const getBadgeText = (estado) => {
  const badges = {
    'disponible': '✅ Disponible',
    'poco_stock': '⚠️ Poco Stock',
    'no_disponible': '❌ Agotado'
  };
  return badges[estado] || estado;
};

const cargarMenu = async () => {
  try {
    const res = await api.getMenu();
    menuItems.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

// ✅ NUEVO: Subir imagen del item a Cloudinary
const subirImagenItem = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validar tamaño (5MB máximo)
  if (file.size > 5 * 1024 * 1024) {
    alert('La imagen es muy grande. Máximo 5MB.');
    return;
  }
  
  subiendoImagen.value = true;
  
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const res = await api.uploadMenuImage(formData);
    newItem.value.image_url = res.data.url;
    
    alert('✅ Imagen subida correctamente');
  } catch (err) {
    console.error('Error subiendo imagen:', err);
    alert('❌ Error al subir la imagen');
  } finally {
    subiendoImagen.value = false;
  }
};

// ✅ NUEVO: Subir iconos de aplicación
const subirIcono = async (event, campo) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validar que sea imagen
  if (!file.type.startsWith('image/')) {
    alert('❌ Solo se permiten imágenes');
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert('❌ La imagen es muy grande. Máximo 2MB.');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('image', file);

    // Usamos el mismo endpoint de upload de menú, Cloudinary maneja todo
    const res = await api.uploadMenuImage(formData);
    
    // Actualizar campo específico en config
    config.value[campo] = res.data.url;

    alert(`✅ Icono subido correctamente. Recuerda Guardar Cambios para aplicar.`);
  } catch (err) {
    console.error('Error subiendo icono:', err);
    alert('❌ Error al subir el icono');
  }
};

// ✅ NUEVO: Subir imagen para item existente
const subirImagenItemExistente = async (event, item) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es muy grande. Máximo 5MB.');
        return;
    }

    itemEditandoImagen.value = item.id;

    try {
        const formData = new FormData();
        formData.append('image', file);

        const res = await api.uploadMenuImage(formData);
        item.image_url = res.data.url;

        // Guardar en BD
        await actualizarItem(item);

        alert('✅ Imagen actualizada');
    } catch (err) {
        console.error('Error subiendo imagen:', err);
        alert('❌ Error al subir la imagen');
    } finally {
        itemEditandoImagen.value = null;
    }
};

// ✅ NUEVO: Eliminar imagen de item existente
const eliminarImagenItem = async (item) => {
    if (!confirm('¿Eliminar la imagen de este plato?')) return;

    item.image_url = '';
    await actualizarItem(item);
};

const crearItem = async () => {
  loading.value = true;
  try {
    const itemData = {
      nombre: newItem.value.nombre,
      descripcion: newItem.value.descripcion,
      categoria: newItem.value.categoria,
      precio: newItem.value.precio,
      tiempo_preparacion_min: newItem.value.tiempo_preparacion_min,
      disponible: true,
      usa_inventario: newItem.value.usa_inventario,
      stock_actual: newItem.value.usa_inventario ? newItem.value.stock_actual : null,
      stock_minimo: newItem.value.usa_inventario ? newItem.value.stock_minimo : 5,
      estado_inventario: newItem.value.usa_inventario ? 'disponible' : 'disponible',
      image_url: newItem.value.image_url || null, // ✅ NUEVO
      es_directo: newItem.value.es_directo // ✅ NUEVO
    };
    
    await api.agregarMenuItem(itemData);
    
    newItem.value = { 
      nombre: '', 
      categoria: '', 
      precio: 0,
      descripcion: '', 
      tiempo_preparacion_min: 15,
      usa_inventario: false,
      stock_actual: 0,
      stock_minimo: 0,
      unidad_medida: 'unidades',
      es_directo: false,
      image_url: '' // ✅ NUEVO
    };
    
    await cargarMenu();
  } catch (err) {
    console.error(err);
    alert('Error creando item');
  } finally {
    loading.value = false;
  }
};

const actualizarItem = async (item) => {
  try {
    await api.updateMenuItem(item.id, item);
  } catch (err) {
    console.error('Error actualizando item', err);
    alert('Error al guardar cambios');
  }
};

const eliminarItem = async (id) => {
  if (!confirm('¿Eliminar este plato del menú?')) return;
  try {
    await api.deleteMenuItem(id);
    await cargarMenu();
  } catch (err) {
    alert('Error al eliminar');
  }
};

// --- MÉTODOS CONFIGURACIÓN ---
const guardando = ref(false);

const procesarImagen = (event, key) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validar tamaño (ej. max 5MB para evitar problemas de red aunque el server acepte 50)
  if (file.size > 5 * 1024 * 1024) {
    alert('La imagen es muy grande. Intenta con una menor a 5MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    config.value[key] = e.target.result;
  };
  reader.readAsDataURL(file);
};

const guardarConfig = async () => {
  guardando.value = true;
  try {
    // Guardar configuración de menú
    await api.saveConfig(config.value);
    // ✅ NUEVO: Guardar porcentaje de propina
    await api.updateConfig('porcentaje_propina', porcentajePropina.value);
    
    // ✅ NUEVO: Aplicar colores inmediatamente
    if (config.value.color_primario) {
      document.documentElement.style.setProperty('--theme-color', config.value.color_primario);
    }
    if (config.value.color_secundario) {
      document.documentElement.style.setProperty('--background-color', config.value.color_secundario);
    }
    
    alert('✅ Configuración guardada en el servidor');
  } catch (err) {
    console.error('Error guardando config:', err);
    alert('❌ Error al guardar configuración');
  } finally {
    guardando.value = false;
  }
};

const cargarConfig = async () => {
  try {
    const res = await api.getConfig();
    if (res.data) {
      // Fusionar con defaults para no perder claves si el server devuelve parcial
      config.value = { ...config.value, ...res.data };
      // ✅ NUEVO: Cargar porcentaje de propina
      if (res.data.porcentaje_propina) {
        porcentajePropina.value = parseFloat(res.data.porcentaje_propina);
      }
      
      // ✅ NUEVO: Aplicar colores guardados
      if (res.data.color_primario) {
        document.documentElement.style.setProperty('--theme-color', res.data.color_primario);
      }
      if (res.data.color_secundario) {
        document.documentElement.style.setProperty('--background-color', res.data.color_secundario);
      }
    }
  } catch (err) {
    console.error('Error cargando config:', err);
  }
};

// --- MÉTODOS MESAS ---
const cargarMesas = async () => {
  try {
    const res = await api.getMesas();
    mesas.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

const crearMesa = async () => {
  loading.value = true;
  try {
    await api.crearMesa(newMesa.value.numero, newMesa.value.capacidad);
    newMesa.value = { numero: '', capacidad: 4 };
    await cargarMesas();
  } catch (err) {
    alert('Error al crear mesa (¿Ya existe el número?)');
  } finally {
    loading.value = false;
  }
};

const eliminarMesa = async (id) => {
  if (!confirm('¿Eliminar esta mesa?')) return;
  try {
    await api.deleteMesa(id);
    await cargarMesas();
  } catch (err) {
    alert('Error al eliminar mesa');
  }
};

onMounted(() => {
  cargarMenu();
  cargarMesas();
  cargarConfig();
 // obtenerIP();
});
</script>

<style src="../assets/styles/EditorPanel.css" scoped></style>
