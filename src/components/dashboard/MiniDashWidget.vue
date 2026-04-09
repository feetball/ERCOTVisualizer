<template>
  <div class="minidash-widget">
    <div
      v-for="item in metrics"
      :key="item.tag"
      class="minidash-cell"
    >
      <div class="minidash-label">{{ item.label }}</div>
      <div class="minidash-value" :style="{ color: item.color }">
        {{ item.displayValue }}
      </div>
      <div class="minidash-trend" :style="{ color: item.trendColor }">
        <component :is="item.trendIcon" :size="10" />
        {{ item.trendText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { dataService } from '@/services/dataService'
import { WIDGET_REFRESH_INTERVAL } from '@/types/widget'
import type { WidgetConfig, WidgetStyle } from '@/types/widget'
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'

defineProps<{
  config?: WidgetConfig
  styleConfig?: WidgetStyle
}>()

interface MetricDisplay {
  tag: string
  label: string
  displayValue: string
  color: string
  trendColor: string
  trendIcon: typeof TrendingUp
  trendText: string
  previousValue: number | null
}

const defaultTags = [
  { tag: 'ERCOT.SYSTEM_LOAD', label: 'Demand', unit: 'MW', color: '#06b6d4' },
  { tag: 'ERCOT.WIND_GEN', label: 'Wind', unit: 'MW', color: '#3b82f6' },
  { tag: 'ERCOT.SOLAR_GEN', label: 'Solar', unit: 'MW', color: '#f59e0b' },
  { tag: 'ERCOT.RT_PRICE', label: 'Price', unit: '$', color: '#22c55e' },
]

const metrics = ref<MetricDisplay[]>(defaultTags.map(t => ({
  tag: t.tag,
  label: t.label,
  displayValue: '---',
  color: t.color,
  trendColor: 'hsl(var(--muted-foreground))',
  trendIcon: Minus,
  trendText: '',
  previousValue: null,
})))

let intervalId: ReturnType<typeof setInterval> | null = null

async function fetchData() {
  for (const metric of metrics.value) {
    try {
      const data = await dataService.getStreamValue(metric.tag)
      const val = data.Value

      // Format
      const tagDef = defaultTags.find(t => t.tag === metric.tag)
      if (tagDef?.unit === '$') {
        metric.displayValue = `$${val.toFixed(1)}`
      } else if (metric.tag.includes('FREQ')) {
        metric.displayValue = val.toFixed(2)
      } else {
        metric.displayValue = Math.round(val).toLocaleString()
      }

      // Trend
      if (metric.previousValue !== null) {
        const diff = val - metric.previousValue
        const pct = metric.previousValue !== 0 ? ((diff / metric.previousValue) * 100).toFixed(1) : '0'
        metric.trendText = `${diff >= 0 ? '+' : ''}${pct}%`
        if (diff > 0) { metric.trendColor = '#22c55e'; metric.trendIcon = TrendingUp }
        else if (diff < 0) { metric.trendColor = '#ef4444'; metric.trendIcon = TrendingDown }
        else { metric.trendColor = 'hsl(var(--muted-foreground))'; metric.trendIcon = Minus }
      }
      metric.previousValue = val
    } catch {
      metric.displayValue = 'ERR'
    }
  }
}

onMounted(() => {
  fetchData()
  intervalId = setInterval(fetchData, WIDGET_REFRESH_INTERVAL * 2)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
.minidash-widget {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 4px;
  height: 100%;
  padding: 6px;
}

.minidash-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 8px;
  background: hsla(var(--card), 0.4);
  border: 1px solid hsla(var(--border), 0.3);
  transition: background 0.2s;
}

.minidash-cell:hover {
  background: hsla(var(--card), 0.7);
}

.minidash-label {
  font-size: 9px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: hsl(var(--muted-foreground));
  margin-bottom: 2px;
}

.minidash-value {
  font-size: clamp(0.9rem, 2.5vw, 1.5rem);
  font-weight: 800;
  line-height: 1.2;
  text-shadow: 0 0 10px currentColor;
}

.minidash-trend {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 9px;
  font-weight: 600;
  margin-top: 2px;
}
</style>
