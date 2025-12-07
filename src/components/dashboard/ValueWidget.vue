<template>
  <div class="fill-height d-flex align-center justify-center flex-column">
    <div class="text-h3 font-weight-bold" :style="valueStyle">{{ formattedValue }}</div>
    <div class="text-caption text-grey">{{ config.tag }}</div>
    <div class="text-caption text-grey-darken-1" v-if="timestamp">{{ timestamp }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { dataService } from '@/services/dataService'
import { format } from 'date-fns'
import { safeCalculate, WIDGET_REFRESH_INTERVAL } from '@/types/widget'
import type { BaseWidgetConfig, WidgetStyle } from '@/types/widget'

const props = defineProps<{
  config: BaseWidgetConfig
  styleConfig?: WidgetStyle
}>()

const value = ref<number | null>(null)
const timestamp = ref<string>('')
let intervalId: ReturnType<typeof setInterval> | null = null

const formattedValue = computed(() => {
  if (value.value === null) return '---'
  const val = safeCalculate(value.value, props.config?.calculation)
  return typeof val === 'number' ? val.toFixed(props.config?.decimals ?? 2) : val
})

const valueStyle = computed(() => {
  const s: Record<string, string> = {}
  if (props.styleConfig?.valueColor) s.color = props.styleConfig.valueColor
  return s
})

async function fetchData() {
  if (!props.config?.tag) return

  try {
    const data = await dataService.getStreamValue(props.config.tag)
    value.value = data.Value
    timestamp.value = format(new Date(data.Timestamp), 'HH:mm:ss')
  } catch (error) {
    console.error('Error fetching value:', error)
  }
}

onMounted(() => {
  fetchData()
  intervalId = setInterval(fetchData, WIDGET_REFRESH_INTERVAL)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>
