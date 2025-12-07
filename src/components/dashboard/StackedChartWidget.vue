<template>
  <div class="fill-height chart-wrapper">
    <apexchart 
      width="100%" 
      height="100%" 
      type="area" 
      :options="chartOptions" 
      :series="series"
    ></apexchart>
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

// Determine if this is a Hz chart (for decimal formatting)
const isHz = computed(() => props.config?.unit === 'Hz')

const chartOptions = computed(() => ({
  chart: {
    id: `stacked-chart-${props.config?.tags?.[0]?.tag || 'default'}`,
    type: 'area',
    stacked: true,
    toolbar: { show: false },
    animations: { enabled: false },
    background: props.style?.backgroundColor || 'transparent'
  },
  colors: props.config?.tags?.map((t: any) => t.color) || ['#1867C0'],
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
        // Hz gets 2 decimals, MW gets 0 decimals
        if (isHz.value) {
          return val.toFixed(2)
        }
        return Math.round(val).toLocaleString()
      }
    },
    title: {
      text: props.config?.unit || ''
    }
  },
  stroke: {
    curve: 'smooth',
    width: 1
  },
  fill: {
    type: 'solid',
    opacity: 0.8
  },
  legend: {
    position: 'top',
    horizontalAlign: 'center',
    labels: {
      colors: '#999'
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
  theme: {
    mode: 'dark'
  },
  grid: {
    borderColor: '#333'
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

    const seriesData: any[] = []

    for (const tagConfig of props.config.tags) {
      const data = await dataService.getStreamPlot(
        tagConfig.tag,
        startTime.toISOString(),
        endTime.toISOString(),
        intervals
      )

      const processedData = data.map((d: any) => ({ 
        x: new Date(d.Timestamp).getTime(), 
        y: d.Value 
      }))

      seriesData.push({
        name: tagConfig.name || tagConfig.tag,
        data: processedData
      })
    }

    series.value = seriesData
  } catch (error) {
    console.error('Error fetching stacked chart data:', error)
  }
}

onMounted(() => fetchData())

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
}
</style>
