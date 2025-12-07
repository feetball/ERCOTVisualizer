<template>
  <div class="gauge-container fill-height">
    <apexchart
      type="radialBar"
      width="100%"
      height="100%"
      :options="gaugeOptions"
      :series="series"
    ></apexchart>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { dataService } from '@/services/dataService'
import { safeCalculate, WIDGET_REFRESH_INTERVAL } from '@/types/widget'
import type { BaseWidgetConfig, WidgetStyle } from '@/types/widget'

const props = defineProps<{
  config: BaseWidgetConfig
  styleConfig?: WidgetStyle
}>()

const currentValue = ref<number | null>(null)
let intervalId: ReturnType<typeof setInterval> | null = null

// Determine if this is Hz (for decimal formatting)
const isHz = computed(() => {
  const tag = props.config?.tag || ''
  const unit = props.config?.unit || ''
  return tag.includes('FREQ') || unit.toLowerCase().includes('hz')
})

// Get min/max with safe defaults
const min = computed(() => props.config?.min ?? 0)
const max = computed(() => props.config?.max ?? 100)

// Calculate percentage for gauge (0-100)
const percentage = computed(() => {
  if (currentValue.value === null) return 0
  const val = safeCalculate(currentValue.value, props.config.calculation)
  const range = max.value - min.value
  // Guard against division by zero
  if (range === 0) return 50
  const pct = ((val - min.value) / range) * 100
  return Math.max(0, Math.min(100, pct))
})

const series = computed(() => [percentage.value])

const displayValue = computed(() => {
  if (currentValue.value === null) return '---'
  const val = safeCalculate(currentValue.value, props.config.calculation)
  // Hz gets 2 decimals, MW gets 0 decimals
  const decimals = props.config?.decimals ?? (isHz.value ? 2 : 0)
  return val.toFixed(decimals)
})

const gaugeColor = computed(() => {
  const pct = percentage.value
  if (props.styleConfig?.valueColor) return props.styleConfig.valueColor
  // Default: green < 60, yellow 60-80, red > 80
  if (pct < 60) return '#4CAF50'
  if (pct < 80) return '#FFC107'
  return '#F44336'
})

const gaugeOptions = computed(() => ({
  chart: {
    type: 'radialBar',
    offsetY: -10,
    sparkline: { enabled: true }
  },
  plotOptions: {
    radialBar: {
      startAngle: -135,
      endAngle: 135,
      hollow: {
        margin: 0,
        size: '70%',
        background: 'transparent'
      },
      track: {
        background: '#333',
        strokeWidth: '100%',
        margin: 5
      },
      dataLabels: {
        name: {
          show: true,
          fontSize: '12px',
          color: '#888',
          offsetY: 60
        },
        value: {
          show: true,
          fontSize: '24px',
          color: props.styleConfig?.valueColor || '#fff',
          offsetY: 0,
          formatter: () => displayValue.value + (props.config?.unit ? ' ' + props.config.unit : '')
        }
      }
    }
  },
  fill: {
    type: 'solid',
    colors: [gaugeColor.value]
  },
  stroke: {
    lineCap: 'round'
  },
  labels: [props.config?.label || '']
}))

async function fetchData() {
  if (!props.config?.tag) return
  try {
    const data = await dataService.getStreamValue(props.config.tag)
    currentValue.value = data.Value
  } catch (error) {
    console.error('Error fetching gauge data:', error)
  }
}

onMounted(() => {
  fetchData()
  intervalId = setInterval(fetchData, WIDGET_REFRESH_INTERVAL)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
.gauge-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
