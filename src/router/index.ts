import { createRouter, createWebHistory } from 'vue-router'
import LargeDisplayView from '../views/LargeDisplayView.vue'
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
      path: '/large-display',
      name: 'largeDisplay',
      component: LargeDisplayView
    }
  ]
})

export default router
