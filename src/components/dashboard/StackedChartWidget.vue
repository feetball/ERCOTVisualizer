<template>
  <div class="fill-height chart-wrapper">
    <apexchart 
      v-if="series.length > 0"
      width="100%" 
      height="100%" 
      type="area" 
      :options="chartOptions" 
      :series="series"
      :key="chartKey"
    ></apexchart>
    <div v-else class="d-flex align-center justify-center fill-height">
      <v-progress-circular indeterminate size="24" color="primary"></v-progress-circular>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { dataService } from '@/services/dataService'
import { WIDGET_REFRESH_INTERVAL } from '@/types/widget'
import type { WidgetStyle, TagConfig } from '@/types/widget'

interface StackedConfig {
  tags?: TagConfig[]
  durationHours?: number
  unit?: string
}

interface DataPoint {
  Timestamp: string
  Value: number
}

interface ChartDataPoint {
  x: number
  y: number
}

interface SeriesData {
  name: string
  data: ChartDataPoint[]
}

const props = defineProps<{
  config: StackedConfig
  styleConfig?: WidgetStyle
}>()

const series = ref<SeriesData[]>([])
const chartKey = ref(0)
let intervalId: ReturnType<typeof setInterval> | null = null

// Determine if this is a Hz chart (for decimal formatting)
const isHz = computed(() => props.config?.unit === 'Hz')

const chartOptions = computed(() => ({
  chart: {
    id: `stacked-chart-${props.config?.tags?.[0]?.tag || 'default'}`,
    type: 'area',
    stacked: true,
    toolbar: { show: false },
    animations: { 
      enabled: true,
      easing: 'easeinout',
      speed: 600,
      animateGradually: {
        enabled: true,
        delay: 100
      }
    },
    background: 'transparent',
    dropShadow: {
      enabled: true,
      top: 0,
      left: 0,
      blur: 8,
      opacity: 0.2
    }
  },
  colors: props.config?.tags?.map((t: TagConfig) => t.color) || ['#00E676'],
  xaxis: {
    type: 'datetime',
    labels: {
      datetimeUTC: false,
      style: {
        colors: 'rgba(255,255,255,0.6)',
        fontSize: '10px'
      }
    },
    axisBorder: {
      show: true,
      color: 'rgba(255,255,255,0.1)'
    },
    axisTicks: {
      color: 'rgba(255,255,255,0.1)'
    }
  },
  yaxis: {
    labels: {
      formatter: (val: number) => {
        if (val === null || val === undefined) return ''
        // Hz gets 2 decimals, MW gets whole numbers with commas
        if (isHz.value) {
          return val.toFixed(2)
        }
        return Math.round(val).toLocaleString()
      },
      style: {
        colors: 'rgba(255,255,255,0.6)',
        fontSize: '10px'
      }
    },
    title: {
      text: props.config?.unit || '',
      style: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: '11px'
      }
    }
  },
  stroke: {
    curve: 'smooth',
    width: 2
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 0.4,
      opacityFrom: 0.9,
      opacityTo: 0.6,
      stops: [0, 90, 100]
    }
  },
  legend: {
    position: 'top',
    horizontalAlign: 'center',
    floating: false,
    fontSize: '11px',
    fontWeight: 500,
    labels: {
      colors: 'rgba(255,255,255,0.8)'
    },
    markers: {
      width: 10,
      height: 10,
      radius: 3
    },
    itemMargin: {
      horizontal: 8,
      vertical: 2
    }
  },
  tooltip: {
    theme: 'dark',
    y: {
      formatter: (val: number) => {
        if (val === null || val === undefined) return ''
        if (isHz.value) {
          return val.toFixed(2) + ' Hz'
        }
        return Math.round(val).toLocaleString() + ' MW'
      }
    }
  },
  theme: {
    mode: 'dark'
  },
  grid: {
    borderColor: 'rgba(255,255,255,0.07)',
    strokeDashArray: 4,
    xaxis: {
      lines: {
        show: false
      }
    }
  },
  dataLabels: {
    enabled: false
  }
}))

async function fetchData() {
  if (!props.config?.tags || props.config.tags.length === 0) return

  try {
    const durationHours = typeof props.config.durationHours === 'number' ? props.config.durationHours : 24
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - durationHours * 60 * 60 * 1000)
    const intervals = 100

    const seriesData: SeriesData[] = []

    for (const tagConfig of props.config.tags) {
      const data: DataPoint[] = await dataService.getStreamPlot(
        tagConfig.tag,
        startTime.toISOString(),
        endTime.toISOString(),
        intervals
      )

      const processedData: ChartDataPoint[] = data.map((d) => ({ 
        x: new Date(d.Timestamp).getTime(), 
        y: d.Value 
      }))

      seriesData.push({
        name: tagConfig.name || tagConfig.tag,
        data: processedData
      })
    }

    series.value = seriesData
    chartKey.value++ // Force re-render with new data
  } catch (error) {
    console.error('Error fetching stacked chart data:', error)
  }
}

onMounted(() => {
  fetchData()
  intervalId = setInterval(fetchData, WIDGET_REFRESH_INTERVAL * 6) // Refresh every 30s
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

watch(
  () => [props.config?.tags, props.config?.durationHours],
  () => {
    fetchData()
  },
  { deep: true }
)
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 100%;
  min-height: 100px;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Ambient glow */
.chart-wrapper::before {
  content: '';
  position: absolute;
  inset: 5%;
  background: radial-gradient(ellipse at 50% 80%, 
    rgba(var(--v-theme-primary), 0.08) 0%, 
    transparent 60%);
  pointer-events: none;
  z-index: 0;
}

.chart-wrapper :deep(.apexcharts-canvas) {
  position: relative;
  z-index: 1;
}

.chart-wrapper :deep(.vue-apexcharts) {
  flex: 1;
  min-height: 0;
}

.chart-wrapper :deep(.apexcharts-legend) {
  padding: 4px 8px !important;
}
</style>
