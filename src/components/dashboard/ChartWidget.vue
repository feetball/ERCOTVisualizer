<template>
  <div class="fill-height chart-wrapper" ref="chartContainer">
    <apexchart 
      v-if="chartHeight > 0"
      width="100%" 
      :height="chartHeight" 
      type="area" 
      :options="chartOptions" 
      :series="series"
    ></apexchart>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { dataService } from '@/services/dataService'
import { safeCalculate, WIDGET_REFRESH_INTERVAL } from '@/types/widget'
import type { BaseWidgetConfig, WidgetStyle } from '@/types/widget'

interface DataPoint {
  Timestamp: string
  Value: number
}

interface ChartDataPoint {
  x: number
  y: number
}

const props = defineProps<{
  config: BaseWidgetConfig
  styleConfig?: WidgetStyle
}>()

const chartContainer = ref<HTMLElement | null>(null)
const chartHeight = ref(0)
const series = ref<{ name: string; data: ChartDataPoint[] }[]>([])
let intervalId: ReturnType<typeof setInterval> | null = null
let resizeObserver: ResizeObserver | null = null

const lineColor = computed(() => props.styleConfig?.valueColor || '#1867C0')

// Determine if this is a Hz chart (for decimal formatting)
const isHz = computed(() => {
  const tag = props.config?.tag || ''
  const unit = props.config?.unit || ''
  return tag.includes('FREQ') || unit.toLowerCase().includes('hz')
})

const chartOptions = computed(() => ({
  chart: {
    id: `chart-${props.config?.tag}`,
    toolbar: { show: false },
    animations: { 
      enabled: true,
      easing: 'easeinout',
      speed: 500,
      animateGradually: {
        enabled: true,
        delay: 150
      },
      dynamicAnimation: {
        enabled: true,
        speed: 350
      }
    },
    background: 'transparent',
    dropShadow: {
      enabled: true,
      top: 3,
      left: 0,
      blur: 10,
      color: lineColor.value,
      opacity: 0.25
    }
  },
  colors: [lineColor.value],
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'dark',
      type: 'vertical',
      shadeIntensity: 0.5,
      gradientToColors: ['transparent'],
      opacityFrom: 0.4,
      opacityTo: 0.05,
      stops: [0, 100]
    }
  },
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
        // Hz gets 2 decimals, MW/other gets 0 decimals
        if (isHz.value) {
          return val.toFixed(2)
        }
        return Math.round(val).toLocaleString()
      },
      style: {
        colors: 'rgba(255,255,255,0.6)',
        fontSize: '10px'
      }
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
  stroke: {
    curve: 'smooth',
    width: 2.5,
    lineCap: 'round'
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
  markers: {
    size: 0,
    hover: {
      size: 6,
      sizeOffset: 3
    }
  }
}))

async function fetchData() {
  if (!props.config?.tag) return

  try {
    // Use durationHours from config if provided, otherwise default to 8
    const durationHours = typeof props.config.durationHours === 'number' ? props.config.durationHours : 8
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - durationHours * 60 * 60 * 1000)

    const intervals = 100
    const data: DataPoint[] = await dataService.getStreamPlot(
      props.config.tag,
      startTime.toISOString(),
      endTime.toISOString(),
      intervals
    )

    const processedData: ChartDataPoint[] = data.map((d) => ({ 
      x: new Date(d.Timestamp).getTime(), 
      y: safeCalculate(d.Value, props.config.calculation)
    }))
    
    series.value = [{
      name: props.config.tag,
      data: processedData
    }]
  } catch (error) {
    console.error('Error fetching chart data:', error)
  }
}

onMounted(() => {
  // Set up resize observer for dynamic height
  if (chartContainer.value) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chartHeight.value = entry.contentRect.height
      }
    })
    resizeObserver.observe(chartContainer.value)
    chartHeight.value = chartContainer.value.offsetHeight
  }
  
  fetchData()
  // Auto-refresh chart data
  intervalId = setInterval(fetchData, WIDGET_REFRESH_INTERVAL * 6) // Refresh every 30s for charts
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
  if (resizeObserver) resizeObserver.disconnect()
})

watch(
  () => [props.config?.tag, props.config?.durationHours],
  () => {
    fetchData()
  }
)
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Subtle glow effect around chart */
.chart-wrapper::before {
  content: '';
  position: absolute;
  inset: 10%;
  background: radial-gradient(ellipse at center, 
    rgba(var(--v-theme-primary), 0.05) 0%, 
    transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.chart-wrapper :deep(.apexcharts-canvas) {
  position: relative;
  z-index: 1;
}
</style>
