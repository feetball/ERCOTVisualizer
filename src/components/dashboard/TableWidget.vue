<template>
  <div class="fill-height">
    <v-data-table
      :headers="headers"
      :items="tableData"
      density="compact"
      class="elevation-0"
      :items-per-page="10"
    >
      <template #item.timestamp="{ item }">
        {{ formatTimestamp(item.timestamp) }}
      </template>
      <template #item.value="{ item }">
        {{ formatValue(item.value) }}
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { dataService } from '@/services/dataService'
import { format } from 'date-fns'
import { safeCalculate, WIDGET_REFRESH_INTERVAL } from '@/types/widget'
import type { BaseWidgetConfig, WidgetStyle } from '@/types/widget'

const props = defineProps<{
  config: BaseWidgetConfig
  styleConfig?: WidgetStyle
}>()

interface TableRow {
  timestamp: string
  value: number
}

const headers = [
  { title: 'Timestamp', key: 'timestamp', sortable: true },
  { title: 'Value', key: 'value', sortable: true }
]

const tableData = ref<TableRow[]>([])
let intervalId: ReturnType<typeof setInterval> | null = null

function formatTimestamp(ts: string) {
  return format(new Date(ts), 'yyyy-MM-dd HH:mm:ss')
}

function formatValue(val: unknown) {
  if (typeof val === 'number') {
    const v = safeCalculate(val, props.config?.calculation)
    return v.toFixed(props.config?.decimals ?? 4)
  }
  return String(val)
}

async function fetchData() {
  if (!props.config?.tag) return

  try {
    const durationHours = props.config.durationHours || 4
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - durationHours * 60 * 60 * 1000)

    const data = await dataService.getStreamPlot(
      props.config.tag,
      startTime.toISOString(),
      endTime.toISOString(),
      50
    )

    tableData.value = data.map((d: any) => ({
      timestamp: d.Timestamp,
      value: d.Value
    }))
  } catch (error) {
    console.error('Error fetching table data:', error)
  }
}

onMounted(() => {
  fetchData()
  intervalId = setInterval(fetchData, WIDGET_REFRESH_INTERVAL * 2) // Refresh every 10s for table
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

watch(() => [props.config?.tag, props.config?.durationHours], () => {
  fetchData()
})
</script>
