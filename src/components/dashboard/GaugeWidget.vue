<template>
  <div class="gauge-container" ref="chartEl"></div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { dataService } from '@/services/dataService'
import { safeCalculate, WIDGET_REFRESH_INTERVAL } from '@/types/widget'
import type { BaseWidgetConfig, WidgetStyle } from '@/types/widget'
import { useECharts, type EChartsOption } from '@/composables/useECharts'
import { ANIMATION_DEFAULTS } from '@/styles/echarts-theme'

const props = defineProps<{
  config: BaseWidgetConfig
  styleConfig?: WidgetStyle
}>()

const chartEl = ref<HTMLElement | null>(null)
const { setOption } = useECharts(chartEl)
const currentValue = ref<number | null>(null)
let intervalId: ReturnType<typeof setInterval> | null = null

const isHz = computed(() => {
  const tag = props.config?.tag || ''
  const unit = props.config?.unit || ''
  return tag.includes('FREQ') || unit.toLowerCase().includes('hz')
})

const min = computed(() => props.config?.min ?? 0)
const max = computed(() => props.config?.max ?? 100)

const percentage = computed(() => {
  if (currentValue.value === null) return 0
  const val = safeCalculate(currentValue.value, props.config.calculation)
  const range = max.value - min.value
  if (range === 0) return 50
  return Math.max(0, Math.min(100, ((val - min.value) / range) * 100))
})

const displayValue = computed(() => {
  if (currentValue.value === null) return '---'
  const val = safeCalculate(currentValue.value, props.config.calculation)
  const decimals = props.config?.decimals ?? (isHz.value ? 2 : 0)
  return val.toFixed(decimals)
})

const gaugeColor = computed(() => {
  const pct = percentage.value
  if (props.styleConfig?.valueColor) return props.styleConfig.valueColor
  if (pct < 60) return '#22c55e'
  if (pct < 80) return '#f59e0b'
  return '#ef4444'
})

function buildOption(): EChartsOption {
  const color = gaugeColor.value
  return {
    ...ANIMATION_DEFAULTS,
    series: [{
      type: 'gauge',
      startAngle: 220,
      endAngle: -40,
      radius: '90%',
      center: ['50%', '55%'],
      min: 0,
      max: 100,
      progress: {
        show: true,
        width: 14,
        roundCap: true,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color },
              { offset: 1, color: lighten(color, 25) },
            ],
          },
          shadowColor: color,
          shadowBlur: 12,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
      },
      axisLine: {
        roundCap: true,
        lineStyle: {
          width: 14,
          color: [[1, 'rgba(255,255,255,0.08)']],
        },
      },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      title: {
        show: true,
        offsetCenter: [0, '70%'],
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: 500,
      },
      detail: {
        offsetCenter: [0, '10%'],
        fontSize: 22,
        fontWeight: 700,
        color: props.styleConfig?.valueColor || '#fff',
        formatter: () => displayValue.value + (props.config?.unit ? ` ${props.config.unit}` : ''),
      },
      data: [{
        value: percentage.value,
        name: props.config?.label || '',
      }],
    }],
  }
}

function lighten(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, (num >> 16) + amt)
  const G = Math.min(255, ((num >> 8) & 0xFF) + amt)
  const B = Math.min(255, (num & 0xFF) + amt)
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
}

async function fetchData() {
  if (!props.config?.tag) return
  try {
    const data = await dataService.getStreamValue(props.config.tag)
    currentValue.value = data.Value
    setOption(buildOption())
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
  position: relative;
}

.gauge-container::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60%;
  height: 60%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, hsla(var(--primary), 0.08) 0%, transparent 70%);
  pointer-events: none;
}
</style>
