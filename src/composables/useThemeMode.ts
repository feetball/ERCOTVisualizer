import { watch } from 'vue'
import { useLocalStorage } from '@/composables/useLocalStorage'

const isDark = useLocalStorage<boolean>('ercot-theme-dark', true)

/** Sync the `dark` class on <html> with the reactive state */
function applyTheme() {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Apply on first import
if (typeof document !== 'undefined') {
  applyTheme()
}

export function useThemeMode() {
  watch(isDark, applyTheme, { immediate: true })

  function toggle() {
    isDark.value = !isDark.value
  }

  return {
    isDark,
    toggle,
  }
}
