import { ref, watch, type Ref } from 'vue'

/**
 * Smoothly animates a numeric value using requestAnimationFrame.
 * Use for dashboard numbers that update periodically — gives a "counting" effect.
 */
export function useAnimatedValue(
  source: Ref<number | null>,
  options: { duration?: number; decimals?: number } = {}
) {
  const { duration = 400, decimals = 0 } = options
  const displayValue = ref(source.value ?? 0)
  let animationId: number | null = null

  watch(source, (newVal, oldVal) => {
    if (newVal === null) return
    const from = oldVal ?? newVal
    const to = newVal
    if (from === to) return

    if (animationId) cancelAnimationFrame(animationId)

    const startTime = performance.now()

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      displayValue.value = from + (to - from) * eased

      if (progress < 1) {
        animationId = requestAnimationFrame(animate)
      } else {
        displayValue.value = to
        animationId = null
      }
    }

    animationId = requestAnimationFrame(animate)
  }, { immediate: true })

  const formatted = ref('')
  watch(displayValue, (v) => {
    formatted.value = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString()
  }, { immediate: true })

  return { displayValue, formatted }
}
