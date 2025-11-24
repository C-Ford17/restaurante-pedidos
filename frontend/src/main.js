import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router' // Importa el router
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)  // Usa el router
app.mount('#app')

// Service Worker eliminado para evitar caché
// if ('serviceWorker' in navigator) { ... }
// Pedir permisos de notificación
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
        console.log('Permisos de notificación:', permission);
    });
}


// ============= DETECTAR ESTADO DE CONEXIÓN =============
window.addEventListener('online', () => {
    console.log('📡 Conexión restaurada');
    // Aquí puedes sincronizar datos pendientes
    window.dispatchEvent(new Event('connection-restored'));
});

window.addEventListener('offline', () => {
    console.log('⚠️ Sin conexión - modo offline activado');
    window.dispatchEvent(new Event('connection-lost'));
});

// Verificar estado inicial
console.log('Estado de conexión:', navigator.onLine ? 'Online' : 'Offline');
