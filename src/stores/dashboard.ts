import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Widget {
  i: string
  x: number
  y: number
  w: number
  h: number
  type: 'chart' | 'table' | 'value'
  title: string
  config: any
}

export const useDashboardStore = defineStore('dashboard', () => {
  const layout = ref<Widget[]>([
    { i: '1', x: 0, y: 0, w: 6, h: 4, type: 'chart', title: 'Temperature Trend', config: { tag: 'sinusoid' } },
    { i: '2', x: 6, y: 0, w: 6, h: 4, type: 'value', title: 'Current Flow', config: { tag: 'cdt158' } }
  ])

  const isEditing = ref(false)

  function addWidget(widget: Widget) {
    layout.value.push(widget)
  }

  function removeWidget(id: string) {
    const index = layout.value.findIndex(w => w.i === id)
    if (index !== -1) {
      layout.value.splice(index, 1)
    }
  }

  function toggleEdit() {
    isEditing.value = !isEditing.value
  }

  function saveLayout() {
    // Save to local storage or backend
    localStorage.setItem('dashboard-layout', JSON.stringify(layout.value))
  }

  function loadLayout() {
    const saved = localStorage.getItem('dashboard-layout')
    if (saved) {
      layout.value = JSON.parse(saved)
    }
  }

  return { layout, isEditing, addWidget, removeWidget, toggleEdit, saveLayout, loadLayout }
})
