import { ref, computed, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { LayoutItem, WidgetConfig, WidgetStyle, WidgetType } from '@/types/widget'

// Re-export types for backwards compatibility
export type { LayoutItem, WidgetConfig, WidgetStyle }

/**
 * Composable for managing grid layout state
 * 
 * @param storageKey - localStorage key for persisting layout
 * @param defaultLayout - Default layout to use if none saved
 */
export function useGridLayout(storageKey: string, defaultLayout: LayoutItem[]) {
  const layout = ref<LayoutItem[]>([])
  const editMode = ref(false)
  const showConfigDialog = ref(false)
  const editingWidget = ref<LayoutItem | null>(null)
  const apiStatus = ref({ connected: true })
  const lastRefresh = ref(new Date())
  const isRefreshing = ref(false)
  const refreshInterval = ref(5)
  let statusCheckInterval: ReturnType<typeof setInterval> | undefined
  let refreshIntervalId: ReturnType<typeof setInterval> | undefined

  const lastRefreshFormatted = computed(() => {
    return lastRefresh.value.toLocaleTimeString()
  })

  // Debounced save to prevent excessive localStorage writes
  const debouncedSave = useDebounceFn(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(layout.value))
    } catch (error) {
      console.error('Failed to save layout:', error)
    }
  }, 500)

  // Watch for layout changes and auto-save (debounced)
  watch(layout, () => {
    if (!editMode.value) return // Only auto-save when not in edit mode
    debouncedSave()
  }, { deep: true })

  function toggleEditMode() {
    editMode.value = !editMode.value
    if (!editMode.value) {
      saveLayout()
    }
  }

  function saveLayout() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(layout.value))
    } catch (error) {
      console.error('Failed to save layout:', error)
    }
  }

  function loadLayout() {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Validate that parsed data is an array
        if (Array.isArray(parsed)) {
          layout.value = parsed
        } else {
          layout.value = [...defaultLayout.map(item => ({ ...item }))]
        }
      } catch {
        layout.value = [...defaultLayout.map(item => ({ ...item }))]
      }
    } else {
      layout.value = [...defaultLayout.map(item => ({ ...item }))]
    }
  }

  function resetLayout() {
    localStorage.removeItem(storageKey)
    layout.value = [...defaultLayout.map(item => ({ ...item }))]
    saveLayout()
  }

  function addWidget(type: WidgetType) {
    editingWidget.value = {
      i: '',
      x: 0,
      y: 0,
      w: 6,
      h: 5,
      type,
      title: '',
      config: { tag: '', durationHours: 4 },
      style: {}
    }
    showConfigDialog.value = true
  }

  function editWidget(item: LayoutItem) {
    editingWidget.value = { ...item }
    showConfigDialog.value = true
  }

  function removeWidget(id: string) {
    const idx = layout.value.findIndex((w) => w.i === id)
    if (idx !== -1) {
      layout.value.splice(idx, 1)
      saveLayout()
    }
  }

  function handleWidgetSave(data: {
    isEditing: boolean
    type: WidgetType
    title: string
    config: WidgetConfig
    style: WidgetStyle
  }) {
    if (data.isEditing && editingWidget.value?.i) {
      // Update existing
      const idx = layout.value.findIndex((w) => w.i === editingWidget.value!.i)
      if (idx !== -1) {
        layout.value[idx] = {
          ...layout.value[idx],
          type: data.type,
          title: data.title,
          config: { ...data.config },
          style: { ...data.style }
        }
      }
    } else {
      // Add new
      const newId = Date.now().toString()
      const defaultSizes: Record<WidgetType, { w: number; h: number }> = {
        chart: { w: 6, h: 6 },
        stacked: { w: 12, h: 8 },
        value: { w: 3, h: 4 },
        stat: { w: 3, h: 5 },
        gauge: { w: 3, h: 5 },
        table: { w: 6, h: 6 }
      }
      const size = defaultSizes[data.type] || { w: 6, h: 5 }
      layout.value.push({
        i: newId,
        x: 0,
        y: 0,
        w: size.w,
        h: size.h,
        type: data.type,
        title: data.title || 'New Widget',
        config: { ...data.config },
        style: { ...data.style }
      })
    }
    saveLayout()
  }

  function refreshAllWidgets() {
    isRefreshing.value = true
    lastRefresh.value = new Date()
    setTimeout(() => {
      isRefreshing.value = false
    }, 500)
  }

  function checkApiStatus() {
    apiStatus.value.connected = true
    lastRefresh.value = new Date()
  }

  function startAutoRefresh() {
    checkApiStatus()
    statusCheckInterval = window.setInterval(checkApiStatus, refreshInterval.value * 1000)
    refreshIntervalId = window.setInterval(() => {
      lastRefresh.value = new Date()
    }, refreshInterval.value * 1000)
  }

  function stopAutoRefresh() {
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval)
    }
    if (refreshIntervalId) {
      clearInterval(refreshIntervalId)
    }
  }

  function getCardStyle(item: LayoutItem) {
    const s: Record<string, string> = {}
    if (item.style?.backgroundColor) s.backgroundColor = item.style.backgroundColor
    return s
  }

  function getTitleStyle(item: LayoutItem) {
    const s: Record<string, string> = { fontSize: item.style?.titleSize || '0.875rem' }
    if (item.style?.titleColor) s.color = item.style.titleColor
    return s
  }

  return {
    layout,
    editMode,
    showConfigDialog,
    editingWidget,
    apiStatus,
    lastRefresh,
    isRefreshing,
    refreshInterval,
    lastRefreshFormatted,
    toggleEditMode,
    saveLayout,
    loadLayout,
    resetLayout,
    addWidget,
    editWidget,
    removeWidget,
    handleWidgetSave,
    refreshAllWidgets,
    startAutoRefresh,
    stopAutoRefresh,
    getCardStyle,
    getTitleStyle
  }
}
