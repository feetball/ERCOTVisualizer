<template>
  <div class="heatcal-widget" ref="chartEl"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useECharts, type EChartsOption } from '@/composables/useECharts'
import { TOOLTIP_STYLE, ANIMATION_DEFAULTS } from '@/styles/echarts-theme'
import { dataService } from '@/services/dataService'
import { WIDGET_REFRESH_INTERVAL } from '@/types/widget'
import type { BaseWidgetConfig, WidgetStyle } from '@/types/widget'
import { format, subDays } from 'date-fns'

const props = defineProps<{
  config: BaseWidgetConfig
  styleConfig?: WidgetStyle
}>()

const chartEl = ref<HTMLElement | null>(null)
const { setOption } = useECharts(chartEl)
let intervalId: ReturnType<typeof setInterval> | null = null

function buildOption(data: [string, number][]): EChartsOption {
  const values = data.map(d => d[1])
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)

  const endDate = format(new Date(), 'yyyy-MM-dd')
  const startDate = format(subDays(new Date(), 89), 'yyyy-MM-dd')

  return {
    ...ANIMATION_DEFAULTS,
    tooltip: {
      ...TOOLTIP_STYLE,
      formatter: (params: unknown) => {
        const p = params as { value?: [string, number] }
        if (!p.value) return ''
        const unit = props.config?.unit || 'MW'
        const val = unit === '$' ? `$${p.value[1].toFixed(1)}` : `${Math.round(p.value[1]).toLocaleString()} ${unit}`
        return `<div style="font-size:11px;opacity:0.7">${p.value[0]}</div><div style="font-weight:600">${val}</div>`
      },
    },
    visualMap: {
      min: minVal,
      max: maxVal,
      calculable: false,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: { color: ['#164e63', '#06b6d4', '#22d3ee', '#67e8f9'] },
      textStyle: { color: 'rgba(255,255,255,0.5)', fontSize: 9 },
      itemWidth: 10,
      itemHeight: 80,
    },
    calendar: {
      top: 20,
      left: 40,
      right: 20,
      bottom: 30,
      range: [startDate, endDate],
      cellSize: ['auto', 'auto'],
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      itemStyle: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.02)' },
      dayLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 9 },
      monthLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },
      yearLabel: { show: false },
    },
    series: [{
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data,
    }],
  }
}

async function fetchData() {
  if (!props.config?.tag) return
  try {
    const now = new Date()
    const start = subDays(now, 89)
    const historical = await dataService.getStreamPlot(
      props.config.tag, start.toISOString(), now.toISOString(), 90
    )

    const data: [string, number][] = historical.map((d: { Timestamp: string; Value: number }) => [
      format(new Date(d.Timestamp), 'yyyy-MM-dd'),
      d.Value,
    ])

    setOption(buildOption(data))
  } catch (error) {
    console.error('Error fetching heatcal data:', error)
  }
}

onMounted(() => {
  fetchData()
  intervalId = setInterval(fetchData, WIDGET_REFRESH_INTERVAL * 12)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

watch(() => props.config?.tag, () => fetchData())
</script>

<style scoped>
.heatcal-widget {
  width: 100%;
  height: 100%;
  min-height: 80px;
}
</style>
