<template>
  <div class="stat-container fill-height" ref="containerRef">
    <div class="stat-content">
      <div class="stat-value" :style="valueStyle">{{ formattedValue }}</div>
      <div class="trend-row" :style="{ color: trendColor }">
        <v-icon :size="trendIconSize" :color="trendColor">{{ trendIcon }}</v-icon>
        <span class="trend-text" :style="{ fontSize: trendFontSize }">{{ trendText }}</span>
      </div>
    </div>
    <div class="sparkline-area" v-if="sparklineData.length > 0">
      <apexchart
        type="area"
        height="100%"
        width="100%"
        :options="sparklineOptions"
        :series="sparklineSeries"
      ></apexchart>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { dataService } from '@/services/dataService'
import { safeCalculate, WIDGET_REFRESH_INTERVAL } from '@/types/widget'
import type { BaseWidgetConfig, WidgetStyle } from '@/types/widget'

interface DataPoint {
  Timestamp: string
  Value: number
}

const props = defineProps<{
  config: BaseWidgetConfig
  styleConfig?: WidgetStyle
}>()

const containerRef = ref<HTMLElement | null>(null)
const containerWidth = ref(200)
const containerHeight = ref(150)
const currentValue = ref<number | null>(null)
const previousValue = ref<number | null>(null)
const sparklineData = ref<number[]>([])
let intervalId: ReturnType<typeof setInterval> | null = null
let resizeObserver: ResizeObserver | null = null

// Determine if this is Hz (for decimal formatting)
const isHz = computed(() => {
  const tag = props.config?.tag || ''
  const unit = props.config?.unit || ''
  return tag.includes('FREQ') || unit.toLowerCase().includes('hz')
})

const formattedValue = computed(() => {
  if (currentValue.value === null) return '---'
  const val = safeCalculate(currentValue.value, props.config?.calculation)
  
  // Hz gets 2 decimals, MW/other gets 0 decimals
  let formatted: string
  if (isHz.value) {
    formatted = val.toFixed(props.config?.decimals ?? 2)
  } else if (Math.abs(val) >= 1000000) {
    formatted = (val / 1000000).toFixed(0) + 'M'
  } else if (Math.abs(val) >= 10000) {
    formatted = (val / 1000).toFixed(0) + 'K'
  } else {
    formatted = Math.round(val).toLocaleString()
  }
  
  // Append unit if provided
  if (props.config?.unit) {
    if (props.config.unit.trim() === '$') {
      formatted = '$' + formatted
    } else {
      formatted += ' ' + props.config.unit
    }
  }
  
  return formatted
})

// Auto-scaling font size based on container width
const valueFontSize = computed(() => {
  // Scale based on container width, with reasonable bounds
  // Guard against zero dimensions
  const width = containerWidth.value || 200
  const height = containerHeight.value || 150
  const baseSize = Math.min(width / 5, height / 3)
  const clampedSize = Math.max(16, Math.min(baseSize, 120)) // Min 16px, max 120px
  return `${clampedSize}px`
})

const trendFontSize = computed(() => {
  const width = containerWidth.value || 200
  const height = containerHeight.value || 150
  const baseSize = Math.min(width / 12, height / 8)
  const clampedSize = Math.max(10, Math.min(baseSize, 24))
  return `${clampedSize}px`
})

const trendIconSize = computed(() => {
  const width = containerWidth.value || 200
  const height = containerHeight.value || 150
  const baseSize = Math.min(width / 14, height / 10)
  return Math.max(12, Math.min(baseSize, 20))
})

const valueStyle = computed(() => ({
  color: props.styleConfig?.valueColor || '#FFFFFF',
  fontSize: valueFontSize.value
}))

const trendDirection = computed(() => {
  if (currentValue.value === null || previousValue.value === null) return 0
  return currentValue.value > previousValue.value ? 1 : currentValue.value < previousValue.value ? -1 : 0
})

const trendColor = computed(() => {
  if (trendDirection.value > 0) return '#4CAF50'
  if (trendDirection.value < 0) return '#F44336'
  return '#9E9E9E'
})

const trendIcon = computed(() => {
  if (trendDirection.value > 0) return 'mdi-trending-up'
  if (trendDirection.value < 0) return 'mdi-trending-down'
  return 'mdi-trending-neutral'
})

const trendText = computed(() => {
  if (currentValue.value === null || previousValue.value === null) return ''
  const diff = currentValue.value - previousValue.value
  const pct = previousValue.value !== 0 ? ((diff / previousValue.value) * 100).toFixed(1) : '0'
  return `${diff >= 0 ? '+' : ''}${pct}%`
})

const sparklineOptions = computed(() => ({
  chart: {
    type: 'area',
    sparkline: { enabled: true },
    animations: { enabled: false }
  },
  stroke: { curve: 'smooth', width: 2 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.1
    }
  },
  colors: [props.styleConfig?.valueColor || '#90CAF9'],
  tooltip: { enabled: false }
}))

const sparklineSeries = computed(() => [{
  name: 'trend',
  data: sparklineData.value
}])

async function fetchData() {
  if (!props.config?.tag) return
  try {
    // Get current value
    const data = await dataService.getStreamValue(props.config.tag)
    previousValue.value = currentValue.value
    currentValue.value = data.Value

    // Get sparkline data (last hour, 20 points)
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - 60 * 60 * 1000)
    const historical: DataPoint[] = await dataService.getStreamPlot(
      props.config.tag,
      startTime.toISOString(),
      endTime.toISOString(),
      20
    )
    sparklineData.value = historical.map((d) => d.Value)
  } catch (error) {
    console.error('Error fetching stat data:', error)
  }
}

function updateSize() {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.offsetWidth
    containerHeight.value = containerRef.value.offsetHeight
  }
}

onMounted(() => {
  fetchData()
  intervalId = setInterval(fetchData, WIDGET_REFRESH_INTERVAL * 2) // Refresh every 10s for stats
  
  // Set up resize observer for responsive sizing
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateSize()
    })
    resizeObserver.observe(containerRef.value)
    updateSize()
  }
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
  if (resizeObserver) resizeObserver.disconnect()
})
</script>

<style scoped>
.stat-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 8px;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 0;
  position: relative;
  z-index: 1;
}

.stat-value {
  font-weight: 800;
  line-height: 1.2;
  text-align: center;
  white-space: nowrap;
  overflow: visible;
  max-width: 100%;
  text-shadow: 0 0 15px rgba(currentColor, 0.3);
  letter-spacing: -0.02em;
  padding: 2px 0;
}

.trend-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(currentColor, 0.1);
  backdrop-filter: blur(4px);
}

.trend-text {
  white-space: nowrap;
  font-weight: 600;
}

.sparkline-area {
  flex: 0 0 35%;
  min-height: 30px;
  max-height: 50%;
  width: 100%;
  position: relative;
  z-index: 1;
  opacity: 0.9;
}

/* Mobile optimizations */
@media (max-width: 599px) {
  .stat-container {
    padding: 12px 8px;
  }
  
  .stat-content {
    padding: 4px 0;
  }
  
  .stat-value {
    letter-spacing: -0.01em;
    padding: 4px 0;
  }
  
  .trend-row {
    margin-top: 8px;
    padding: 6px 14px;
  }
  
  .sparkline-area {
    flex: 0 0 30%;
    min-height: 40px;
  }
}
</style>
