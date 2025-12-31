import { createRouter, createWebHistory } from 'vue-router';
import HomeView from './components/HomeView.vue';
import MenuView from './components/MenuView.vue';
import PedidoStatus from './components/PedidoStatus.vue';
import MesasQR from './components/MesasQR.vue';
import CuentaView from './views/CuentaView.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/menu', component: MenuView },
  { path: '/pedido/:id/status', component: PedidoStatus },
  // { path: '/mesa/:id', component: PedidoStatus }, // Old route causing conflicts
  { path: '/mesa/:id', redirect: to => `/mesa/${to.params.id}/welcome` }, // Redirect old QRs to new flow
  { path: '/mesas-qr', name: 'mesas-qr', component: MesasQR },
  { path: '/cuenta/:id', name: 'cuenta', component: CuentaView },

  // Customer Routes
  {
    path: '/mesa/:tableId',
    component: () => import('./views/customer/CustomerLayout.vue'),
    children: [
      { path: 'welcome', name: 'customer-welcome', component: () => import('./views/customer/CustomerWelcome.vue') },
      // Placeholders for next steps - will be implemented shortly
      { path: 'menu', name: 'customer-menu', component: () => import('./views/customer/CustomerMenu.vue') },
      { path: 'status', name: 'customer-status', component: () => import('./views/customer/CustomerStatus.vue') } // ✅ Updated to use specific component
    ]
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
