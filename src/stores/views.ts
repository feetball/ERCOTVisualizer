import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useLocalStorage } from '@/composables/useLocalStorage'
import type { LayoutItem } from '@/composables/useGridLayout'

export interface CustomView {
  id: string
  name: string
  path: string
  isPublic: boolean
  createdAt: string
  layout: LayoutItem[]
}

export const useViewsStore = defineStore('views', () => {
  const customViews = useLocalStorage<CustomView[]>('custom-views', [])

  // Create a new view
  function createView(name: string, isPublic: boolean) {
    const id = `view-${Date.now()}`
    const path = `/view/${id}`
    
    const newView: CustomView = {
      id,
      name,
      path,
      isPublic,
      createdAt: new Date().toISOString(),
      layout: []
    }
    
    customViews.value.push(newView)
    return newView
  }

  // Update view layout
  function updateViewLayout(viewId: string, layout: LayoutItem[]) {
    const view = customViews.value.find(v => v.id === viewId)
    if (view) {
      view.layout = layout
    }
  }

  // Update view name
  function updateViewName(viewId: string, name: string) {
    if (!viewId || !name || name.trim().length < 2) {
      return
    }
    const view = customViews.value.find(v => v.id === viewId)
    if (view) {
      view.name = name.trim()
    }
  }

  // Delete a view
  function deleteView(viewId: string) {
    const index = customViews.value.findIndex(v => v.id === viewId)
    if (index !== -1) {
      customViews.value.splice(index, 1)
    }
  }

  // Get view by ID
  function getViewById(viewId: string) {
    return customViews.value.find(v => v.id === viewId)
  }

  // Get all public views
  const publicViews = computed(() => 
    customViews.value.filter(v => v.isPublic)
  )

  // Get all private views
  const privateViews = computed(() => 
    customViews.value.filter(v => !v.isPublic)
  )

  return {
    customViews,
    publicViews,
    privateViews,
    createView,
    updateViewLayout,
    updateViewName,
    deleteView,
    getViewById
  }
})
