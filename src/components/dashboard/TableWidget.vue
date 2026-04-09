<template>
  <div class="table-widget">
    <table>
      <thead>
        <tr>
          <th @click="sortBy = 'timestamp'; sortAsc = !sortAsc">Timestamp</th>
          <th @click="sortBy = 'value'; sortAsc = !sortAsc">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in paginatedData" :key="row.timestamp">
          <td>{{ formatTimestamp(row.timestamp) }}</td>
          <td>{{ formatValue(row.value) }}</td>
        </tr>
      </tbody>
    </table>
    <div class="table-footer" v-if="tableData.length > pageSize">
      <span class="tw-text-xs tw-text-muted-foreground">{{ page * pageSize + 1 }}-{{ Math.min((page + 1) * pageSize, tableData.length) }} of {{ tableData.length }}</span>
      <div class="tw-flex tw-gap-1">
        <button class="page-btn" :disabled="page === 0" @click="page--">&lt;</button>
        <button class="page-btn" :disabled="(page + 1) * pageSize >= tableData.length" @click="page++">&gt;</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { dataService } from '@/services/dataService'
import { format } from 'date-fns'
import { safeCalculate, WIDGET_REFRESH_INTERVAL } from '@/types/widget'
import type { BaseWidgetConfig, WidgetStyle } from '@/types/widget'

const props = defineProps<{
  config: BaseWidgetConfig
  styleConfig?: WidgetStyle
}>()

interface TableRow { timestamp: string; value: number }

const tableData = ref<TableRow[]>([])
const page = ref(0)
const pageSize = 10
const sortBy = ref<'timestamp' | 'value'>('timestamp')
const sortAsc = ref(false)
let intervalId: ReturnType<typeof setInterval> | null = null

const sortedData = computed(() => {
  const data = [...tableData.value]
  data.sort((a, b) => {
    const aVal = sortBy.value === 'timestamp' ? new Date(a.timestamp).getTime() : a.value
    const bVal = sortBy.value === 'timestamp' ? new Date(b.timestamp).getTime() : b.value
    return sortAsc.value ? aVal - bVal : bVal - aVal
  })
  return data
})

const paginatedData = computed(() => sortedData.value.slice(page.value * pageSize, (page.value + 1) * pageSize))

function formatTimestamp(ts: string) { return format(new Date(ts), 'yyyy-MM-dd HH:mm:ss') }
function formatValue(val: unknown) {
  if (typeof val === 'number') return safeCalculate(val, props.config?.calculation).toFixed(props.config?.decimals ?? 4)
  return String(val)
}

async function fetchData() {
  if (!props.config?.tag) return
  try {
    const durationHours = props.config.durationHours || 4
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - durationHours * 60 * 60 * 1000)
    const data = await dataService.getStreamPlot(props.config.tag, startTime.toISOString(), endTime.toISOString(), 50)
    tableData.value = data.map((d: { Timestamp: string; Value: number }) => ({ timestamp: d.Timestamp, value: d.Value }))
  } catch (error) { console.error('Error fetching table data:', error) }
}

onMounted(() => { fetchData(); intervalId = setInterval(fetchData, WIDGET_REFRESH_INTERVAL * 2) })
onUnmounted(() => { if (intervalId) clearInterval(intervalId) })
watch(() => [props.config?.tag, props.config?.durationHours], () => fetchData())
</script>

<style scoped>
.table-widget { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
table { width: 100%; border-collapse: collapse; font-size: 12px; flex: 1; overflow-y: auto; }
thead { position: sticky; top: 0; }
th { text-align: left; padding: 6px 8px; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: hsl(var(--muted-foreground)); border-bottom: 1px solid hsla(var(--border), 0.5); cursor: pointer; user-select: none; background: hsl(var(--card)); }
th:hover { color: hsl(var(--foreground)); }
td { padding: 4px 8px; color: hsl(var(--foreground)); border-bottom: 1px solid hsla(var(--border), 0.2); font-family: var(--font-mono, monospace); font-size: 11px; }
tr:hover td { background: hsla(var(--accent), 0.3); }
.table-footer { display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; border-top: 1px solid hsla(var(--border), 0.5); }
.page-btn { padding: 2px 8px; border-radius: 4px; font-size: 12px; background: hsla(var(--accent), 0.5); color: hsl(var(--foreground)); border: 1px solid hsla(var(--border), 0.5); cursor: pointer; }
.page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.page-btn:hover:not(:disabled) { background: hsla(var(--accent), 0.8); }
</style>
