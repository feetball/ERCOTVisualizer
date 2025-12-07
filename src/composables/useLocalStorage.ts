import { ref, watch, Ref } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
  const data = ref<T>(defaultValue) as Ref<T>

  // Load initial value
  try {
    const stored = localStorage.getItem(key)
    if (stored !== null) {
      data.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error)
    data.value = defaultValue
  }

  // Watch for changes and persist
  watch(
    data,
    (newValue) => {
      try {
        localStorage.setItem(key, JSON.stringify(newValue))
      } catch (error) {
        console.error(`Failed to save ${key} to localStorage:`, error)
      }
    },
    { deep: true }
  )

  return data
}

export function removeFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Failed to remove ${key} from localStorage:`, error)
  }
}
