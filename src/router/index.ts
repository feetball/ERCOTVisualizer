import { createRouter, createWebHistory } from 'vue-router'
import WallboardView from '../views/WallboardView.vue'
import SystemSummaryView from '../views/SystemSummaryView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: SystemSummaryView
    },
    {
      path: '/system-summary',
      name: 'systemSummary',
      component: SystemSummaryView
    },
    {
      path: '/wallboard',
      name: 'wallboard',
      component: WallboardView
    }
  ]
})

export default router
