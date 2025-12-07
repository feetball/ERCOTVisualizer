import { onMounted, onUpdated, ref } from 'vue'

/**
 * Performance monitoring composable
 * 
 * Tracks component mount and update timings for debugging.
 * Only logs in development mode to avoid production console noise.
 * 
 * @param componentName - Name of the component being monitored
 * @returns Object with performance metrics
 */
export function usePerformance(componentName: string) {
  const lastUpdate = ref(Date.now())
  const mountTime = ref<number | null>(null)
  const updateCount = ref(0)

  // Only enable logging in development
  const isDev = import.meta.env.DEV

  onMounted(() => {
    mountTime.value = Date.now()
    if (isDev) {
      console.debug(`[Perf] ${componentName} mounted at ${new Date().toISOString()}`)
    }
  })

  onUpdated(() => {
    const now = Date.now()
    updateCount.value++
    if (isDev) {
      console.debug(`[Perf] ${componentName} updated #${updateCount.value}. Delta: ${now - lastUpdate.value}ms`)
    }
    lastUpdate.value = now
  })

  return {
    lastUpdate,
    mountTime,
    updateCount
  }
}
