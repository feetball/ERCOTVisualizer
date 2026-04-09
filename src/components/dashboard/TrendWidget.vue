<template>
  <div class="trend-widget" ref="containerRef">
    <div class="trend-main">
      <div class="trend-value" :style="{ color: styleConfig?.valueColor || 'hsl(var(--foreground))' }">
        {{ formattedValue }}
      </div>
      <div class="trend-deltas">
        <div class="trend-delta" :style="{ color: delta1h.color }">
          <component :is="delta1h.icon" :size="12" />
          <span>{{ delta1h.text }} <span class="delta-label">vs 1h</span></span>
        </div>
        <div class="trend-delta" :style="{ color: delta24h.color }">
          <component :is="delta24h.icon" :size="12" />
          <span>{{ delta24h.text }} <span class="delta-label">vs 24h</span></span>
        </div>
      </div>
    </div>
    <div class="trend-sparkline" ref="sparklineEl"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { dataService } from '@/services/dataService'
import { safeCalculate, WIDGET_REFRESH_INTERVAL } from '@/types/widget'
import type { BaseWidgetConfig, WidgetStyle } from '@/types/widget'
import { useECharts } from '@/composables/useECharts'
import { areaGradient } from '@/styles/echarts-theme'
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'

const props = defineProps<{
  config: BaseWidgetConfig
  styleConfig?: WidgetStyle
}>()

const containerRef = ref<HTMLElement | null>(null)
const sparklineEl = ref<HTMLElement | null>(null)
const currentValue = ref<number | null>(null)
const value1hAgo = ref<number | null>(null)
const value24hAgo = ref<number | null>(null)
const sparklineData = ref<number[]>([])
let intervalId: ReturnType<typeof setInterval> | null = null

const { setOption: setSparklineOption } = useECharts(sparklineEl)

const isHz = computed(() => {
  const tag = props.config?.tag || ''
  const unit = props.config?.unit || ''
  return tag.includes('FREQ') || unit.toLowerCase().includes('hz')
})

const formattedValue = computed(() => {
  if (currentValue.value === null) return '---'
  const val = safeCalculate(currentValue.value, props.config?.calculation)
  const decimals = props.config?.decimals ?? (isHz.value ? 2 : 0)
  let formatted = isHz.value ? val.toFixed(decimals) : Math.round(val).toLocaleString()
  if (props.config?.unit) {
    formatted = props.config.unit === '$' ? '$' + formatted : formatted + ' ' + props.config.unit
  }
  return formatted
})

function computeDelta(current: number | null, previous: number | null) {
  if (current === null || previous === null) return { text: '--', color: 'hsl(var(--muted-foreground))', icon: Minus }
  const diff = current - previous
  const pct = previous !== 0 ? ((diff / previous) * 100).toFixed(1) : '0'
  const text = `${diff >= 0 ? '+' : ''}${pct}%`
  if (diff > 0) return { text, color: '#22c55e', icon: TrendingUp }
  if (diff < 0) return { text, color: '#ef4444', icon: TrendingDown }
  return { text, color: 'hsl(var(--muted-foreground))', icon: Minus }
}

const delta1h = computed(() => computeDelta(currentValue.value, value1hAgo.value))
const delta24h = computed(() => computeDelta(currentValue.value, value24hAgo.value))

async function fetchData() {
  if (!props.config?.tag) return
  try {
    const now = new Date()
    const data = await dataService.getStreamValue(props.config.tag)
    currentValue.value = data.Value

    // 1h ago
    const t1h = new Date(now.getTime() - 60 * 60 * 1000)
    const hist1h = await dataService.getStreamPlot(props.config.tag, t1h.toISOString(), now.toISOString(), 20)
    if (hist1h.length > 0) value1hAgo.value = hist1h[0].Value
    sparklineData.value = hist1h.map((d: { Value: number }) => d.Value)

    // 24h ago
    const t24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const hist24h = await dataService.getStreamPlot(props.config.tag, t24h.toISOString(), t1h.toISOString(), 5)
    if (hist24h.length > 0) value24hAgo.value = hist24h[0].Value

    updateSparkline()
  } catch (error) {
    console.error('Error fetching trend data:', error)
  }
}

function updateSparkline() {
  if (!sparklineData.value.length) return
  const color = props.styleConfig?.valueColor || '#06b6d4'
  setSparklineOption({
    animation: false,
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: { type: 'category', show: false, data: sparklineData.value.map((_, i) => i) },
    yAxis: { type: 'value', show: false, min: (v: { min: number }) => v.min * 0.98, max: (v: { max: number }) => v.max * 1.02 },
    series: [{ type: 'line', smooth: 0.4, symbol: 'none', lineStyle: { width: 2, color }, areaStyle: { color: areaGradient(color, 0.3, 0.02) }, data: sparklineData.value }],
  })
}

onMounted(() => {
  fetchData()
  intervalId = setInterval(fetchData, WIDGET_REFRESH_INTERVAL * 2)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
.trend-widget {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 8px;
}

.trend-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 0;
}

.trend-value {
  font-size: clamp(1.5rem, 4vw, 3rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  text-shadow: 0 0 15px rgba(currentColor, 0.2);
}

.trend-deltas {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.trend-delta {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  background: rgba(currentColor, 0.08);
}

.delta-label {
  opacity: 0.5;
  font-weight: 400;
}

.trend-sparkline {
  flex: 0 0 30%;
  min-height: 24px;
}
</style>
