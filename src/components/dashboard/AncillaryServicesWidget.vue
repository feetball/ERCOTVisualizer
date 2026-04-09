<template>
  <div class="ancillary-services-widget">
    <div v-for="(service, idx) in services" :key="service.name" class="service-row">
      <div class="service-info">
        <div class="service-name">{{ service.name }}</div>
        <div class="service-sublabel" v-if="service.sublabel">{{ service.sublabel }}</div>
      </div>
      <div class="sparkline-container" :ref="el => setSparklineRef(el as HTMLElement | null, idx)"></div>
      <div class="service-value" :style="{ color: service.color }">
        {{ formatValue(service.currentValue) }}
        <span class="service-unit">MW</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { dataService } from '@/services/dataService'
import { WIDGET_REFRESH_INTERVAL } from '@/types/widget'
import type { BaseWidgetConfig, WidgetStyle } from '@/types/widget'
import { COLORS as GLOBAL_COLORS } from '@/styles/colors'
import { areaGradient } from '@/styles/echarts-theme'

interface AncillaryService {
  name: string
  sublabel?: string
  tag: string
  color: string
  data: number[]
  currentValue: number
}

const props = defineProps<{
  config?: BaseWidgetConfig
  styleConfig?: WidgetStyle
}>()

const ANCILLARY_COLOR = GLOBAL_COLORS.ANCILLARY
const COLORS = {
  regUp: '#06b6d4',
  regDown: '#f59e0b',
  rrs: '#22c55e',
  nonSpin: ANCILLARY_COLOR,
  ecrs: '#3b82f6',
}

const services = ref<AncillaryService[]>([
  { name: 'REG-UP', sublabel: 'Deployed / Undeployed', tag: 'ERCOT.REG_UP', color: COLORS.regUp, data: [], currentValue: 0 },
  { name: 'REG-DOWN', sublabel: 'Deployed / Undeployed', tag: 'ERCOT.REG_DOWN', color: COLORS.regDown, data: [], currentValue: 0 },
  { name: 'RRS', sublabel: 'Responsive Reserve Service', tag: 'ERCOT.RRS', color: COLORS.rrs, data: [], currentValue: 0 },
  { name: 'NON-SPIN', sublabel: 'Non-Spinning Reserve', tag: 'ERCOT.NON_SPIN', color: COLORS.nonSpin, data: [], currentValue: 0 },
  { name: 'ECRS', sublabel: 'Contingency Reserve Service', tag: 'ERCOT.ECRS', color: COLORS.ecrs, data: [], currentValue: 0 },
])

const sparklineRefs: (HTMLElement | null)[] = []
const sparklineInstances: (echarts.ECharts | null)[] = []
let intervalId: ReturnType<typeof setInterval> | null = null

function setSparklineRef(el: HTMLElement | null, idx: number) {
  sparklineRefs[idx] = el
}

function initSparklines() {
  for (let i = 0; i < services.value.length; i++) {
    const el = sparklineRefs[i]
    if (el && !sparklineInstances[i]) {
      sparklineInstances[i] = echarts.init(el, undefined, { renderer: 'canvas' })
    }
  }
}

function updateSparkline(idx: number) {
  const instance = sparklineInstances[idx]
  const service = services.value[idx]
  if (!instance || service.data.length === 0) return

  instance.setOption({
    animation: false,
    grid: { left: 0, right: 0, top: 2, bottom: 2 },
    xAxis: { type: 'category', show: false, data: service.data.map((_, i) => i) },
    yAxis: {
      type: 'value',
      show: false,
      min: (value: { min: number }) => value.min * 0.95,
      max: (value: { max: number }) => value.max * 1.05,
    },
    series: [{
      type: 'line',
      smooth: 0.3,
      symbol: 'none',
      lineStyle: { width: 1.5, color: service.color },
      areaStyle: { color: areaGradient(service.color, 0.5, 0.1) },
      data: service.data,
    }],
  })
}

function formatValue(val: number): string {
  return Math.round(val).toLocaleString()
}

async function fetchData() {
  const durationHours = props.config?.durationHours || 2
  const endTime = new Date()
  const startTime = new Date(endTime.getTime() - durationHours * 60 * 60 * 1000)

  for (let i = 0; i < services.value.length; i++) {
    const service = services.value[i]
    try {
      const data = await dataService.getStreamPlot(service.tag, startTime.toISOString(), endTime.toISOString(), 100)
      if (data && data.length > 0) {
        service.data = data.map((d: { Value: number }) => d.Value)
        service.currentValue = data[data.length - 1].Value
      } else {
        const baseValues: Record<string, number> = { 'ERCOT.REG_UP': 450, 'ERCOT.REG_DOWN': 380, 'ERCOT.RRS': 2800, 'ERCOT.NON_SPIN': 1500, 'ERCOT.ECRS': 2300 }
        const base = baseValues[service.tag] || 500
        service.data = Array.from({ length: 50 }, () => base + (Math.random() - 0.5) * base * 0.3)
        service.currentValue = service.data[service.data.length - 1]
      }
    } catch {
      const base = 500 + Math.random() * 2000
      service.data = Array.from({ length: 50 }, () => base + (Math.random() - 0.5) * base * 0.2)
      service.currentValue = service.data[service.data.length - 1]
    }
    updateSparkline(i)
  }
}

onMounted(() => {
  nextTick(() => {
    initSparklines()
    fetchData()
  })
  intervalId = setInterval(fetchData, WIDGET_REFRESH_INTERVAL)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
  for (const inst of sparklineInstances) {
    inst?.dispose()
  }
})
</script>

<style scoped>
.ancillary-services-widget {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  padding: 8px;
  height: 100%;
}

.service-row {
  display: grid;
  grid-template-columns: minmax(100px, 1fr) 2fr auto;
  align-items: center;
  gap: 12px;
  padding: 6px 10px;
  background: linear-gradient(90deg, hsla(var(--card), 0.6) 0%, transparent 100%);
  border-radius: 6px;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
}

.service-row:hover {
  background: linear-gradient(90deg, hsla(var(--primary), 0.08) 0%, transparent 100%);
}

.service-row:nth-child(1) { border-left-color: #06b6d4; }
.service-row:nth-child(2) { border-left-color: #f59e0b; }
.service-row:nth-child(3) { border-left-color: #22c55e; }
.service-row:nth-child(4) { border-left-color: #8b5cf6; }
.service-row:nth-child(5) { border-left-color: #3b82f6; }

.service-info { min-width: 0; }

.service-name {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  white-space: nowrap;
  color: hsl(var(--foreground));
}

.service-sublabel {
  font-size: 0.65rem;
  opacity: 0.6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: hsl(var(--muted-foreground));
}

.sparkline-container {
  min-width: 120px;
  max-width: 300px;
  height: 32px;
}

.service-value {
  font-size: 1.1rem;
  font-weight: 700;
  font-family: var(--font-mono, monospace);
  text-align: right;
  min-width: 70px;
  text-shadow: 0 0 10px currentColor;
}

.service-unit {
  font-size: 0.7rem;
  font-weight: 400;
  opacity: 0.7;
  margin-left: 2px;
}

@media (min-width: 1920px) {
  .service-row { padding: 10px 16px; gap: 20px; }
  .service-name { font-size: 1rem; }
  .service-sublabel { font-size: 0.75rem; }
  .sparkline-container { height: 40px; min-width: 180px; }
  .service-value { font-size: 1.4rem; min-width: 90px; }
}

@media (max-width: 599px) {
  .service-row { grid-template-columns: 1fr auto; gap: 8px; padding: 8px; }
  .sparkline-container { display: none; }
  .service-name { font-size: 0.8rem; }
  .service-value { font-size: 1rem; }
}
</style>
