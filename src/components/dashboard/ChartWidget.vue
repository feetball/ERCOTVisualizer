<template>
  <div class="fill-height chart-wrapper">
    <apexchart width="100%" height="100%" type="line" :options="chartOptions" :series="series"></apexchart>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { dataService } from '@/services/dataService'

const props = defineProps<{
  config: any
  style?: any
}>()

const series = ref<any[]>([])

const lineColor = computed(() => props.style?.valueColor || '#1867C0')

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
    animations: { enabled: false },
    background: props.style?.backgroundColor || 'transparent'
  },
  colors: [lineColor.value],
  xaxis: {
    type: 'datetime',
    labels: {
      datetimeUTC: false
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
      }
    }
  },
  tooltip: {
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
    width: 2
  },
  theme: {
    mode: 'dark'
  },
  grid: {
    borderColor: '#333'
  }
}))

async function fetchData() {
  if (!props.config.tag) return

  try {
    // Use durationHours from config if provided, otherwise default to 8
    const durationHours = typeof props.config.durationHours === 'number' ? props.config.durationHours : 8
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - durationHours * 60 * 60 * 1000)

    const intervals = 100
    const data = await dataService.getStreamPlot(
      props.config.tag,
      startTime.toISOString(),
      endTime.toISOString(),
      intervals
    )

    let processedData = data.map((d: any) => ({ x: new Date(d.Timestamp).getTime(), y: d.Value }))
    
    // Apply calculation if provided
    if (props.config?.calculation) {
      try {
        const fn = new Function('value', props.config.calculation)
        processedData = processedData.map((p: any) => ({ ...p, y: fn(p.y) }))
      } catch (e) {
        console.error('Calculation error:', e)
      }
    }
    
    series.value = [{
      name: props.config.tag,
      data: processedData
    }]
  } catch (error) {
    console.error('Error fetching chart data:', error)
  }
}

onMounted(() => fetchData())

watch(
  () => [props.config.tag, props.config.durationHours],
  () => {
    fetchData()
  }
)
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 100%;
}
</style>
