<template>
  <div class="stat-container" ref="containerRef">
    <div class="stat-content">
      <div class="stat-value-wrapper">
        <div ref="valueRef" class="stat-value" :style="[valueStyle, valueTransformStyle]">{{ formattedValue }}</div>
      </div>
      <div class="trend-row" :style="{ color: trendColor }">
        <component :is="trendIconComponent" :size="trendIconSize" />
        <span class="trend-text" :style="{ fontSize: trendFontSize }">{{ trendText }}</span>
      </div>
    </div>
    <div class="sparkline-area" v-if="sparklineData.length > 0" ref="sparklineEl"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { dataService } from '@/services/dataService'
import { safeCalculate, WIDGET_REFRESH_INTERVAL } from '@/types/widget'
import type { BaseWidgetConfig, WidgetStyle } from '@/types/widget'
import { useECharts } from '@/composables/useECharts'
import { areaGradient } from '@/styles/echarts-theme'
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'

interface DataPoint {
  Timestamp: string
  Value: number
}

const props = defineProps<{
  config: BaseWidgetConfig
  styleConfig?: WidgetStyle
}>()

const containerRef = ref<HTMLElement | null>(null)
const valueRef = ref<HTMLElement | null>(null)
const sparklineEl = ref<HTMLElement | null>(null)
const scale = ref(1)
const containerWidth = ref(200)
const containerHeight = ref(150)
const currentValue = ref<number | null>(null)
const previousValue = ref<number | null>(null)
const sparklineData = ref<number[]>([])
let intervalId: ReturnType<typeof setInterval> | null = null
let resizeObserver: ResizeObserver | null = null

// ECharts sparkline
const { setOption: setSparklineOption } = useECharts(sparklineEl)

const isHz = computed(() => {
  const tag = props.config?.tag || ''
  const unit = props.config?.unit || ''
  return tag.includes('FREQ') || unit.toLowerCase().includes('hz')
})

const formattedValue = computed(() => {
  if (currentValue.value === null) return '---'
  const val = safeCalculate(currentValue.value, props.config?.calculation)
  let formatted: string
  if (isHz.value) {
    formatted = val.toFixed(props.config?.decimals ?? 2)
  } else if (props.config?.decimals !== undefined) {
    formatted = val.toFixed(props.config.decimals)
  } else {
    formatted = Math.round(val).toLocaleString()
  }
  if (props.config?.unit) {
    if (props.config.unit.trim() === '$') {
      formatted = '$' + formatted
    } else {
      formatted += ' ' + props.config.unit
    }
  }
  return formatted
})

const valueFontSize = computed(() => {
  const width = containerWidth.value || 200
  const height = containerHeight.value || 150
  const len = Math.max(1, (formattedValue.value || '').length)
  const horizontalScale = width / (4 + len * 0.12)
  const verticalScale = height / 2.8
  const baseSize = Math.min(horizontalScale, verticalScale)
  return `${Math.round(Math.max(14, Math.min(baseSize, 140)))}px`
})

const trendFontSize = computed(() => {
  const width = containerWidth.value || 200
  const height = containerHeight.value || 150
  const baseSize = Math.min(width / 14, height / 10)
  return `${Math.round(Math.max(9, Math.min(baseSize, 22)))}px`
})

const trendIconSize = computed(() => {
  const width = containerWidth.value || 200
  const height = containerHeight.value || 150
  const baseSize = Math.min(width / 16, height / 12)
  return Math.round(Math.max(12, Math.min(baseSize, 22)))
})

const valueStyle = computed(() => ({
  color: props.styleConfig?.valueColor || '#FFFFFF',
  fontSize: valueFontSize.value,
  whiteSpace: 'nowrap' as const,
  display: 'inline-block',
  transformOrigin: 'center center',
}))

const valueTransformStyle = computed(() => ({
  transform: `scale(${scale.value})`,
  display: 'inline-block',
  willChange: 'transform' as const,
}))

const trendDirection = computed(() => {
  if (currentValue.value === null || previousValue.value === null) return 0
  return currentValue.value > previousValue.value ? 1 : currentValue.value < previousValue.value ? -1 : 0
})

const trendColor = computed(() => {
  if (trendDirection.value > 0) return '#22c55e'
  if (trendDirection.value < 0) return '#ef4444'
  return '#6b7280'
})

const trendIconComponent = computed(() => {
  if (trendDirection.value > 0) return TrendingUp
  if (trendDirection.value < 0) return TrendingDown
  return Minus
})

const trendText = computed(() => {
  if (currentValue.value === null || previousValue.value === null) return ''
  const diff = currentValue.value - previousValue.value
  const pct = previousValue.value !== 0 ? ((diff / previousValue.value) * 100).toFixed(1) : '0'
  return `${diff >= 0 ? '+' : ''}${pct}%`
})

function updateSparkline() {
  if (sparklineData.value.length === 0) return
  const color = props.styleConfig?.valueColor || '#06b6d4'
  setSparklineOption({
    animation: false,
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: { type: 'category', show: false, data: sparklineData.value.map((_, i) => i) },
    yAxis: {
      type: 'value',
      show: false,
      min: (value: { min: number }) => value.min * 0.98,
      max: (value: { max: number }) => value.max * 1.02,
    },
    series: [{
      type: 'line',
      smooth: 0.4,
      symbol: 'none',
      lineStyle: { width: 2, color },
      areaStyle: { color: areaGradient(color, 0.4, 0.05) },
      data: sparklineData.value,
    }],
  })
}

async function fetchData() {
  if (!props.config?.tag) return
  try {
    const data = await dataService.getStreamValue(props.config.tag)
    previousValue.value = currentValue.value
    currentValue.value = data.Value

    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - 60 * 60 * 1000)
    const historical: DataPoint[] = await dataService.getStreamPlot(
      props.config.tag, startTime.toISOString(), endTime.toISOString(), 20
    )
    sparklineData.value = historical.map(d => d.Value)
    updateSparkline()
  } catch (error) {
    console.error('Error fetching stat data:', error)
  }
}

function updateSize() {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.offsetWidth
    containerHeight.value = containerRef.value.offsetHeight
  }
  computeScale()
}

function computeScale() {
  nextTick(() => {
    if (!valueRef.value || !containerRef.value) { scale.value = 1; return }
    const padding = 16
    const availableW = Math.max(20, containerWidth.value - padding)
    const sparklineReserve = containerHeight.value < 260 ? containerHeight.value * 0.35 : containerHeight.value * 0.3
    const trendReserve = 32
    const availableH = Math.max(24, containerHeight.value - padding - sparklineReserve - trendReserve)
    const measuredW = valueRef.value.scrollWidth || 1
    const measuredH = valueRef.value.scrollHeight || 1
    const sW = availableW / measuredW
    const sH = availableH / measuredH
    scale.value = Math.max(0.5, Math.min(1, sW, sH))
  })
}

onMounted(() => {
  fetchData()
  intervalId = setInterval(fetchData, WIDGET_REFRESH_INTERVAL * 2)
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => updateSize())
    resizeObserver.observe(containerRef.value)
    updateSize()
  }
  watch(formattedValue, () => computeScale())
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
  overflow: visible;
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
  overflow: visible;
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

.stat-value-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
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

@media (max-width: 599px) {
  .stat-container { padding: 12px 8px; }
  .stat-content { padding: 4px 0; }
  .stat-value { letter-spacing: -0.01em; padding: 4px 0; }
  .trend-row { margin-top: 8px; padding: 6px 14px; }
  .sparkline-area { flex: 0 0 30%; min-height: 40px; }
}
</style>
