<template>
  <div class="fill-height chart-wrapper" ref="chartContainer">
    <apexchart 
      v-if="chartHeight > 0 && series.length > 0 && series[0].data.length > 0"
      width="100%" 
      :height="chartHeight" 
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
import { safeCalculate, WIDGET_REFRESH_INTERVAL } from '@/types/widget'
import type { BaseWidgetConfig, WidgetStyle } from '@/types/widget'
import { COLORS } from '@/styles/colors'

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
const chartKey = ref(0)
const series = ref<{ name: string; data: ChartDataPoint[] }[]>([])
let intervalId: ReturnType<typeof setInterval> | null = null
let resizeObserver: ResizeObserver | null = null

const defaultColor = props.styleConfig?.valueColor || COLORS.DEMAND
const lineColor = ref(defaultColor)

// Determine if this is a Hz chart (for decimal formatting)
const isHz = computed(() => {
  const tag = props.config?.tag || ''
  const unit = props.config?.unit || ''
  return tag.includes('FREQ') || unit.toLowerCase().includes('hz')
})

function formatValue(val: number, unit: string | undefined, decimals: number) {
  const fixed = val.toFixed(decimals)
  if (unit === '$') return `$${fixed}`
  return unit ? `${fixed} ${unit}` : fixed
}

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
  dataLabels: {
    enabled: false
  },
  colors: [lineColor.value],
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'dark',
      type: 'vertical',
      shadeIntensity: 0.5,
      gradientToColors: [lineColor.value],
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
        const unit = props.config?.unit || (isHz.value ? 'Hz' : 'MW')
        const decimals = props.config?.decimals ?? (isHz.value ? 2 : 0)
        return formatValue(val, unit, decimals)
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
        const unit = props.config?.unit || (isHz.value ? 'Hz' : 'MW')
        const decimals = props.config?.decimals ?? (isHz.value ? 2 : 0)
        return formatValue(val, unit, decimals)
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
    const lastValue = processedData.length > 0 ? processedData[processedData.length - 1].y : undefined

    if (props.config?.tag?.includes('SYSTEM_LOAD') && typeof lastValue === 'number') {
      if (lastValue >= 50000) {
        lineColor.value = COLORS.DEMAND_HIGH
      } else if (lastValue >= 45000) {
        lineColor.value = COLORS.DEMAND_MEDIUM
      } else {
        lineColor.value = COLORS.DEMAND_LOW
      }
    } else {
      lineColor.value = defaultColor
    }
    
    series.value = [{
      name: props.config.tag,
      data: processedData
    }]
    
    // Force chart re-render with new data
    chartKey.value++
  } catch (error) {
    console.error('Error fetching chart data:', error)
  }
}

onMounted(() => {
  // Set up resize observer for dynamic height
  if (chartContainer.value) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height
        if (height > 0) {
          chartHeight.value = height
        }
      }
    })
    resizeObserver.observe(chartContainer.value)
    
    // Get initial height - use requestAnimationFrame to ensure layout is complete
    requestAnimationFrame(() => {
      if (chartContainer.value) {
        const height = chartContainer.value.offsetHeight || chartContainer.value.clientHeight
        if (height > 0) {
          chartHeight.value = height
        } else {
          // Fallback: set a minimum height if container has no height yet
          chartHeight.value = 200
        }
      }
    })
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
  min-height: 100px;
  position: relative;
  display: flex;
  flex-direction: column;
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

.chart-wrapper :deep(.vue-apexcharts) {
  flex: 1;
  min-height: 0;
}
</style>
