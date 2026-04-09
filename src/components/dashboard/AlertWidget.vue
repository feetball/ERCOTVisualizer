<template>
  <div class="alert-widget" :class="alertClass">
    <div class="alert-indicator" :style="{ backgroundColor: alertColor }">
      <component :is="alertIconComponent" :size="22" :color="iconColor" />
    </div>
    <div class="alert-info" v-if="showLabel">
      <div class="alert-value" :style="{ color: alertColor }" v-if="currentValue !== null">{{ formattedValue }}</div>
      <div class="alert-label" :style="{ color: alertColor }">{{ alertLabel }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { dataService } from '@/services/dataService'
import { WIDGET_REFRESH_INTERVAL } from '@/types/widget'
import type { BaseWidgetConfig, WidgetStyle } from '@/types/widget'
import { CheckCircle, AlertCircle, AlertTriangle, OctagonAlert } from 'lucide-vue-next'

interface AlertThreshold {
  level: 'normal' | 'caution' | 'warning' | 'alert'
  min?: number
  max?: number
}

interface AlertConfig extends BaseWidgetConfig {
  thresholds?: AlertThreshold[]
  invertLogic?: boolean
  showLabel?: boolean
}

const props = defineProps<{
  config: AlertConfig
  styleConfig?: WidgetStyle
}>()

const currentValue = ref<number | null>(null)
let intervalId: ReturnType<typeof setInterval> | null = null

const defaultThresholds = computed((): AlertThreshold[] => {
  const tag = props.config?.tag || ''
  if (tag.includes('GRID_FREQ')) {
    return [
      { level: 'normal', min: 59.97, max: 60.03 },
      { level: 'caution', min: 59.95, max: 60.05 },
      { level: 'warning', min: 59.93, max: 60.07 },
      { level: 'alert', min: 59.90, max: 60.10 }
    ]
  } else if (tag.includes('OP_RESERVES')) {
    return [
      { level: 'normal', min: 10000 },
      { level: 'caution', min: 7000, max: 10000 },
      { level: 'warning', min: 5000, max: 7000 },
      { level: 'alert', max: 5000 }
    ]
  } else if (tag.includes('SYSTEM_LOAD')) {
    return [
      { level: 'normal', max: 50000 },
      { level: 'caution', min: 50000, max: 60000 },
      { level: 'warning', min: 60000, max: 70000 },
      { level: 'alert', min: 70000 }
    ]
  } else if (tag.includes('RT_PRICE')) {
    return [
      { level: 'normal', max: 50 },
      { level: 'caution', min: 50, max: 100 },
      { level: 'warning', min: 100, max: 500 },
      { level: 'alert', min: 500 }
    ]
  }
  return [
    { level: 'normal', min: 0, max: 25 },
    { level: 'caution', min: 25, max: 50 },
    { level: 'warning', min: 50, max: 75 },
    { level: 'alert', min: 75 }
  ]
})

const thresholds = computed(() => props.config?.thresholds || defaultThresholds.value)
const showLabel = computed(() => props.config?.showLabel !== false)

const currentLevel = computed((): 'normal' | 'caution' | 'warning' | 'alert' => {
  if (currentValue.value === null) return 'normal'
  const val = currentValue.value
  const tag = props.config?.tag || ''
  if (tag.includes('GRID_FREQ')) {
    const deviation = Math.abs(val - 60.0)
    if (deviation <= 0.03) return 'normal'
    if (deviation <= 0.05) return 'caution'
    if (deviation <= 0.07) return 'warning'
    return 'alert'
  }
  for (const t of thresholds.value) {
    const inMin = t.min === undefined || val >= t.min
    const inMax = t.max === undefined || val < t.max
    if (inMin && inMax) return t.level
  }
  return 'normal'
})

const alertColors = { normal: '#22c55e', caution: '#eab308', warning: '#f97316', alert: '#ef4444' }
const alertColor = computed(() => alertColors[currentLevel.value])
const alertClass = computed(() => `alert-${currentLevel.value}`)

const alertIconComponent = computed(() => {
  switch (currentLevel.value) {
    case 'normal': return CheckCircle
    case 'caution': return AlertCircle
    case 'warning': return AlertTriangle
    case 'alert': return OctagonAlert
    default: return CheckCircle
  }
})

const iconColor = computed(() => currentLevel.value === 'caution' ? '#000' : '#fff')
const alertLabel = computed(() => {
  switch (currentLevel.value) {
    case 'normal': return 'Normal'
    case 'caution': return 'Caution'
    case 'warning': return 'Warning'
    case 'alert': return 'Alert'
    default: return 'Unknown'
  }
})

const formattedValue = computed(() => {
  if (currentValue.value === null) return '--'
  const decimals = props.config?.decimals ?? 0
  const unit = props.config?.unit || ''
  const val = currentValue.value.toFixed(decimals)
  return unit ? `${val} ${unit}` : val
})

async function fetchData() {
  if (!props.config?.tag) return
  try {
    const result = await dataService.getStreamValue(props.config.tag)
    currentValue.value = result.Value
  } catch (error) {
    console.error('Error fetching alert data:', error)
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

<style scoped>
.alert-widget {
  padding: 6px;
  border-radius: 4px;
  transition: all 0.25s ease;
  gap: 4px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.alert-indicator {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.alert-normal .alert-indicator { box-shadow: 0 0 12px #22c55e; animation: pulse-glow 1.8s ease-in-out infinite; }
.alert-caution .alert-indicator { box-shadow: 0 0 12px #eab308; animation: pulse-glow-fast 1.5s ease-in-out infinite; }
.alert-warning .alert-indicator { box-shadow: 0 0 16px #f97316; animation: pulse-glow-fast 1s ease-in-out infinite; }
.alert-alert .alert-indicator { box-shadow: 0 0 20px #ef4444; animation: pulse-glow-fast 0.5s ease-in-out infinite; }

@keyframes pulse-glow { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
@keyframes pulse-glow-fast { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.1); } }

.alert-info { display: flex; flex-direction: column; align-items: center; text-align: center; width: 100%; }
.alert-value { font-size: 0.7rem; font-family: var(--font-mono, monospace); opacity: 0.8; text-shadow: 0 0 14px currentColor; line-height: 1.2; }
.alert-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.95; margin-top: 1px; }
</style>
