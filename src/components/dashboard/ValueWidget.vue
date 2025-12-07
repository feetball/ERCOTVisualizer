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

const props = defineProps<{
  config: any
  style?: any
}>()

const value = ref<number | null>(null)
const timestamp = ref<string>('')
let intervalId: any = null

const formattedValue = computed(() => {
  if (value.value === null) return '---'
  let val = value.value
  if (props.config?.calculation) {
    try {
      const fn = new Function('value', props.config.calculation)
      val = fn(val)
    } catch (e) {
      console.error('Calculation error:', e)
    }
  }
  return typeof val === 'number' ? val.toFixed(2) : val
})

const valueStyle = computed(() => {
  const s: any = {}
  if (props.style?.valueColor) s.color = props.style.valueColor
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
  intervalId = setInterval(fetchData, 5000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>
