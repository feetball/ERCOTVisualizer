import { createRouter, createWebHistory } from 'vue-router'
import LargeDisplayView from '../views/LargeDisplayView.vue'
import GridSummaryView from '../views/GridSummaryView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: GridSummaryView
    },
    {
      path: '/grid-summary',
      name: 'gridSummary',
      component: GridSummaryView
    },
    {
      path: '/large-display',
      name: 'largeDisplay',
      component: LargeDisplayView
    },
    {
      path: '/view/:id',
      name: 'customView',
      component: () => import('../views/CustomView.vue')
    },
    {
      path: '/help',
      name: 'help',
      component: () => import('../views/HelpView.vue')
    }
  ]
})

export default router
