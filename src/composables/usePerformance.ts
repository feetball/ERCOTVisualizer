import { onMounted, onUpdated, ref } from 'vue'

export function usePerformance(componentName: string) {
  const lastUpdate = ref(Date.now())

  onMounted(() => {
    console.log(`[Perf] ${componentName} mounted at ${new Date().toISOString()}`)
  })

  onUpdated(() => {
    const now = Date.now()
    console.log(`[Perf] ${componentName} updated. Time since last update: ${now - lastUpdate.value}ms`)
    lastUpdate.value = now
  })
}
