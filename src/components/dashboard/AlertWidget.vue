<template>
  <div class="alert-widget fill-height d-flex flex-column align-center justify-center" :class="alertClass">
    <div class="alert-indicator" :style="{ backgroundColor: alertColor }">
      <v-icon :icon="alertIcon" :color="iconColor" :size="iconSize"></v-icon>
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

interface AlertThreshold {
  level: 'normal' | 'caution' | 'warning' | 'alert'
  min?: number
  max?: number
}

interface AlertConfig extends BaseWidgetConfig {
  thresholds?: AlertThreshold[]
  invertLogic?: boolean // true = higher values are better (like reserves)
  showLabel?: boolean
}

const props = defineProps<{
  config: AlertConfig
  styleConfig?: WidgetStyle
}>()

const currentValue = ref<number | null>(null)
let intervalId: ReturnType<typeof setInterval> | null = null

// Default thresholds based on tag type
const defaultThresholds = computed((): AlertThreshold[] => {
  const tag = props.config?.tag || ''
  
  if (tag.includes('GRID_FREQ')) {
    // Frequency: 60.00 is ideal, deviation is bad
    return [
      { level: 'normal', min: 59.97, max: 60.03 },
      { level: 'caution', min: 59.95, max: 60.05 },
      { level: 'warning', min: 59.93, max: 60.07 },
      { level: 'alert', min: 59.90, max: 60.10 }
    ]
  } else if (tag.includes('OP_RESERVES')) {
    // Reserves: higher is better
    return [
      { level: 'normal', min: 10000 },
      { level: 'caution', min: 7000, max: 10000 },
      { level: 'warning', min: 5000, max: 7000 },
      { level: 'alert', max: 5000 }
    ]
  } else if (tag.includes('SYSTEM_LOAD')) {
    // Demand: lower is generally better
    return [
      { level: 'normal', max: 50000 },
      { level: 'caution', min: 50000, max: 60000 },
      { level: 'warning', min: 60000, max: 70000 },
      { level: 'alert', min: 70000 }
    ]
  } else if (tag.includes('RT_PRICE')) {
    // Price: lower is better for consumers
    return [
      { level: 'normal', max: 50 },
      { level: 'caution', min: 50, max: 100 },
      { level: 'warning', min: 100, max: 500 },
      { level: 'alert', min: 500 }
    ]
  }
  
  // Generic default
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
  
  // Special handling for frequency (centered value)
  if (tag.includes('GRID_FREQ')) {
    const deviation = Math.abs(val - 60.0)
    if (deviation <= 0.03) return 'normal'
    if (deviation <= 0.05) return 'caution'
    if (deviation <= 0.07) return 'warning'
    return 'alert'
  }
  
  // Check thresholds
  for (const t of thresholds.value) {
    const inMin = t.min === undefined || val >= t.min
    const inMax = t.max === undefined || val < t.max
    if (inMin && inMax) {
      return t.level
    }
  }
  
  return 'normal'
})

const alertColors = {
  normal: '#4CAF50',   // Green
  caution: '#FFEB3B',  // Yellow
  warning: '#FF9800',  // Orange
  alert: '#F44336'     // Red
}

const alertColor = computed(() => alertColors[currentLevel.value])

const alertClass = computed(() => `alert-${currentLevel.value}`)

const alertIcon = computed(() => {
  switch (currentLevel.value) {
    case 'normal': return 'mdi-check-circle'
    case 'caution': return 'mdi-alert-circle'
    case 'warning': return 'mdi-alert'
    case 'alert': return 'mdi-alert-octagon'
    default: return 'mdi-circle'
  }
})

const iconColor = computed(() => {
  return currentLevel.value === 'caution' ? '#000' : '#fff'
})

const iconSize = computed(() => {
  return 26 // Slightly smaller to prevent clipping in compact cards
})

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
  align-items: center;
  justify-content: center;
}

.alert-indicator {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 14px currentColor;
  animation: pulse-glow 1.8s ease-in-out infinite;
}

.alert-normal .alert-indicator {
  box-shadow: 0 0 12px #4CAF50;
}

.alert-caution .alert-indicator {
  box-shadow: 0 0 12px #FFEB3B;
  animation: pulse-glow-fast 1.5s ease-in-out infinite;
}

.alert-warning .alert-indicator {
  box-shadow: 0 0 16px #FF9800;
  animation: pulse-glow-fast 1s ease-in-out infinite;
}

.alert-alert .alert-indicator {
  box-shadow: 0 0 20px #F44336;
  animation: pulse-glow-fast 0.5s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

@keyframes pulse-glow-fast {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

.alert-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 0;
  width: 100%;
}

.alert-value {
  font-size: 1.8rem;
  font-family: 'Roboto Mono', monospace;
  font-weight: 800;
  line-height: 1.05;
  text-shadow: 0 0 14px currentColor;
}

.alert-label {
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.95;
  margin-top: 4px;
}

.alert-value {
  font-size: 0.75rem;
  font-family: 'Roboto Mono', monospace;
  opacity: 0.8;
}

/* Compact mode - just the indicator */
.alert-widget:not(:has(.alert-info)) {
  padding: 4px;
}
</style>
