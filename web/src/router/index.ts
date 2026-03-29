import DashboardView from '@web/views/DashboardView.vue'
import LoginView from '@web/views/LoginView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DashboardView,
      name: 'Dashboard',
    },
    {
      path: '/login',
      component: LoginView,
      name: 'Login',
    },
  ],
})

export default router
