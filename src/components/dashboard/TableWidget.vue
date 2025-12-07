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
import { ref, onMounted, watch } from 'vue'
import { dataService } from '@/services/dataService'
import { format } from 'date-fns'

const props = defineProps<{
  config: any
  style?: any
}>()

const headers = [
  { title: 'Timestamp', key: 'timestamp', sortable: true },
  { title: 'Value', key: 'value', sortable: true }
]

const tableData = ref<any[]>([])

function formatTimestamp(ts: string) {
  return format(new Date(ts), 'yyyy-MM-dd HH:mm:ss')
}

function formatValue(val: any) {
  if (typeof val === 'number') {
    let v = val
    if (props.config?.calculation) {
      try {
        const fn = new Function('value', props.config.calculation)
        v = fn(v)
      } catch (e) {
        console.error('Calculation error:', e)
      }
    }
    return v.toFixed(4)
  }
  return val
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
})

watch(() => [props.config?.tag, props.config?.durationHours], () => {
  fetchData()
})
</script>
