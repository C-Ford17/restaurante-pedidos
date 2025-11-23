import { createRouter, createWebHistory } from 'vue-router';
import MenuView from '../components/MenuView.vue';

const routes = [
  
  { path: '/menu', component: MenuView }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
