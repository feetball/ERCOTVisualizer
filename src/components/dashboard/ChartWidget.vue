<template>
  <div class="chart-wrapper" ref="chartEl"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { dataService } from '@/services/dataService'
import { safeCalculate, WIDGET_REFRESH_INTERVAL } from '@/types/widget'
import type { BaseWidgetConfig, WidgetStyle } from '@/types/widget'
import { COLORS } from '@/styles/colors'
import { useECharts, type EChartsOption } from '@/composables/useECharts'
import { AXIS_STYLE, TOOLTIP_STYLE, GRID_STYLE, ANIMATION_DEFAULTS, areaGradient } from '@/styles/echarts-theme'
import { format } from 'date-fns'

const props = defineProps<{
  config: BaseWidgetConfig
  styleConfig?: WidgetStyle
}>()

const chartEl = ref<HTMLElement | null>(null)
const { setOption } = useECharts(chartEl)
let intervalId: ReturnType<typeof setInterval> | null = null

const defaultColor = props.styleConfig?.valueColor || COLORS.DEMAND
const lineColor = ref(defaultColor)

const isHz = computed(() => {
  const tag = props.config?.tag || ''
  const unit = props.config?.unit || ''
  return tag.includes('FREQ') || unit.toLowerCase().includes('hz')
})

function formatValue(val: number) {
  const unit = props.config?.unit || (isHz.value ? 'Hz' : 'MW')
  const decimals = props.config?.decimals ?? (isHz.value ? 2 : 0)
  const fixed = val.toFixed(decimals)
  if (unit === '$') return `$${fixed}`
  return unit ? `${fixed} ${unit}` : fixed
}

function buildOption(xData: number[], yData: number[]): EChartsOption {
  const color = lineColor.value
  return {
    ...ANIMATION_DEFAULTS,
    tooltip: {
      ...TOOLTIP_STYLE,
      trigger: 'axis',
      formatter: (params: unknown) => {
        const p = (params as Array<{ value: [number, number] }>)[0]
        if (!p) return ''
        const time = format(new Date(p.value[0]), 'MMM d, h:mm a')
        return `<div style="font-size:11px;opacity:0.7">${time}</div><div style="font-weight:600;font-size:13px;color:${color}">${formatValue(p.value[1])}</div>`
      },
    },
    grid: GRID_STYLE,
    xAxis: {
      type: 'time',
      ...AXIS_STYLE,
      axisLabel: {
        ...AXIS_STYLE.axisLabel,
        formatter: (val: number) => format(new Date(val), 'h:mm a'),
      },
    },
    yAxis: {
      type: 'value',
      ...AXIS_STYLE,
      axisLabel: {
        ...AXIS_STYLE.axisLabel,
        formatter: (val: number) => formatValue(val),
      },
    },
    series: [{
      type: 'line',
      smooth: 0.4,
      symbol: 'none',
      lineStyle: { width: 2.5, color, cap: 'round' },
      areaStyle: { color: areaGradient(color) },
      emphasis: {
        lineStyle: { width: 3 },
        itemStyle: { borderWidth: 2, borderColor: color },
      },
      data: xData.map((x, i) => [x, yData[i]]),
    }],
  }
}

async function fetchData() {
  if (!props.config?.tag) return
  try {
    const durationHours = typeof props.config.durationHours === 'number' ? props.config.durationHours : 8
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - durationHours * 60 * 60 * 1000)
    const data = await dataService.getStreamPlot(props.config.tag, startTime.toISOString(), endTime.toISOString(), 100)

    const xData: number[] = []
    const yData: number[] = []
    for (const d of data) {
      xData.push(new Date(d.Timestamp).getTime())
      yData.push(safeCalculate(d.Value, props.config.calculation))
    }

    // Color based on demand level
    const lastValue = yData.length > 0 ? yData[yData.length - 1] : undefined
    if (props.config?.tag?.includes('SYSTEM_LOAD') && typeof lastValue === 'number') {
      lineColor.value = lastValue >= 50000 ? COLORS.DEMAND_HIGH : lastValue >= 45000 ? COLORS.DEMAND_MEDIUM : COLORS.DEMAND_LOW
    } else {
      lineColor.value = defaultColor
    }

    setOption(buildOption(xData, yData))
  } catch (error) {
    console.error('Error fetching chart data:', error)
  }
}

onMounted(() => {
  fetchData()
  intervalId = setInterval(fetchData, WIDGET_REFRESH_INTERVAL * 6)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

watch(() => [props.config?.tag, props.config?.durationHours], () => fetchData())
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 100%;
  min-height: 100px;
  position: relative;
}

.chart-wrapper::before {
  content: '';
  position: absolute;
  inset: 10%;
  background: radial-gradient(ellipse at center, hsla(var(--primary), 0.05) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}
</style>
