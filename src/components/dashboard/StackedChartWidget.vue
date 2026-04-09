<template>
  <div class="chart-wrapper" ref="chartEl"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { dataService } from '@/services/dataService'
import { WIDGET_REFRESH_INTERVAL } from '@/types/widget'
import type { WidgetStyle, TagConfig } from '@/types/widget'
import { useECharts, type EChartsOption } from '@/composables/useECharts'
import { AXIS_STYLE, TOOLTIP_STYLE, GRID_STYLE, ANIMATION_DEFAULTS, areaGradient } from '@/styles/echarts-theme'
import { format } from 'date-fns'

interface StackedConfig {
  tags?: TagConfig[]
  durationHours?: number
  unit?: string
}

const props = defineProps<{
  config: StackedConfig
  styleConfig?: WidgetStyle
}>()

const chartEl = ref<HTMLElement | null>(null)
const { setOption } = useECharts(chartEl)
let intervalId: ReturnType<typeof setInterval> | null = null

const isHz = computed(() => props.config?.unit === 'Hz')

function formatVal(val: number) {
  if (isHz.value) return val.toFixed(2) + ' Hz'
  return Math.round(val).toLocaleString() + ' MW'
}

function buildOption(allSeries: { name: string; color: string; data: [number, number][] }[]): EChartsOption {
  return {
    ...ANIMATION_DEFAULTS,
    tooltip: {
      ...TOOLTIP_STYLE,
      trigger: 'axis',
      axisPointer: { type: 'cross', label: { backgroundColor: '#1a1f2e' } },
    },
    legend: {
      top: 0,
      textStyle: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 8,
      itemGap: 12,
    },
    grid: { ...GRID_STYLE, top: 32 },
    xAxis: {
      type: 'time',
      ...AXIS_STYLE,
      axisLabel: { ...AXIS_STYLE.axisLabel, formatter: (val: number) => format(new Date(val), 'h:mm a') },
    },
    yAxis: {
      type: 'value',
      ...AXIS_STYLE,
      axisLabel: { ...AXIS_STYLE.axisLabel, formatter: (val: number) => formatVal(val) },
    },
    series: allSeries.map(s => ({
      name: s.name,
      type: 'line' as const,
      stack: 'total',
      smooth: 0.3,
      symbol: 'none',
      lineStyle: { width: 1.5, color: s.color },
      areaStyle: { color: areaGradient(s.color, 0.7, 0.3) },
      emphasis: { focus: 'series' as const },
      data: s.data,
    })),
  }
}

async function fetchData() {
  if (!props.config?.tags || props.config.tags.length === 0) return
  try {
    const durationHours = typeof props.config.durationHours === 'number' ? props.config.durationHours : 24
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - durationHours * 60 * 60 * 1000)

    const allSeries: { name: string; color: string; data: [number, number][] }[] = []

    for (const tagConfig of props.config.tags) {
      const data = await dataService.getStreamPlot(tagConfig.tag, startTime.toISOString(), endTime.toISOString(), 100)
      allSeries.push({
        name: tagConfig.name || tagConfig.tag,
        color: tagConfig.color || '#06b6d4',
        data: data.map((d: { Timestamp: string; Value: number }) => [new Date(d.Timestamp).getTime(), d.Value]),
      })
    }

    setOption(buildOption(allSeries))
  } catch (error) {
    console.error('Error fetching stacked chart data:', error)
  }
}

onMounted(() => {
  fetchData()
  intervalId = setInterval(fetchData, WIDGET_REFRESH_INTERVAL * 6)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

watch(() => [props.config?.tags, props.config?.durationHours], () => fetchData(), { deep: true })
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
  inset: 5%;
  background: radial-gradient(ellipse at 50% 80%, hsla(var(--primary), 0.06) 0%, transparent 60%);
  pointer-events: none;
}
</style>
