<template>
  <div class="ancillary-services-widget fill-height pa-2">
    <div v-for="service in services" :key="service.name" class="service-row">
      <div class="service-info">
        <div class="service-name">{{ service.name }}</div>
        <div class="service-sublabel" v-if="service.sublabel">{{ service.sublabel }}</div>
      </div>
      <div class="sparkline-container">
        <apexchart
          type="line"
          height="32"
          :options="getSparklineOptions(service.color)"
          :series="[{ data: service.data }]"
        />
      </div>
      <div class="service-value" :style="{ color: service.color }">
        {{ formatValue(service.currentValue) }}
        <span class="service-unit">MW</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { dataService } from '@/services/dataService'
import { WIDGET_REFRESH_INTERVAL } from '@/types/widget'
import type { BaseWidgetConfig, WidgetStyle } from '@/types/widget'
import { COLORS as GLOBAL_COLORS } from '@/styles/colors'

const apexchart = VueApexCharts

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

// Ancillary service colors - using global ancillary color as base
const ANCILLARY_COLOR = GLOBAL_COLORS.ANCILLARY
const COLORS = {
  regUp: '#00BCD4',      // Cyan for Reg-Up
  regDown: '#FF9800',    // Orange for Reg-Down
  rrs: '#4CAF50',        // Green for RRS
  nonSpin: ANCILLARY_COLOR,  // Global ancillary color for Non-Spin
  ecrs: '#2196F3'        // Blue for ECRS
}

const services = ref<AncillaryService[]>([
  { 
    name: 'REG-UP', 
    sublabel: 'Deployed / Undeployed',
    tag: 'ERCOT.REG_UP', 
    color: COLORS.regUp, 
    data: [], 
    currentValue: 0 
  },
  { 
    name: 'REG-DOWN', 
    sublabel: 'Deployed / Undeployed',
    tag: 'ERCOT.REG_DOWN', 
    color: COLORS.regDown, 
    data: [], 
    currentValue: 0 
  },
  { 
    name: 'RRS', 
    sublabel: 'Responsive Reserve Service',
    tag: 'ERCOT.RRS', 
    color: COLORS.rrs, 
    data: [], 
    currentValue: 0 
  },
  { 
    name: 'NON-SPIN', 
    sublabel: 'Non-Spinning Reserve',
    tag: 'ERCOT.NON_SPIN', 
    color: COLORS.nonSpin, 
    data: [], 
    currentValue: 0 
  },
  { 
    name: 'ECRS', 
    sublabel: 'Contingency Reserve Service',
    tag: 'ERCOT.ECRS', 
    color: COLORS.ecrs, 
    data: [], 
    currentValue: 0 
  }
])

let intervalId: ReturnType<typeof setInterval> | null = null

function getSparklineOptions(color: string) {
  return {
    chart: {
      type: 'line',
      sparkline: { enabled: true },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      },
      toolbar: { show: false }
    },
    stroke: {
      width: 2,
      curve: 'smooth'
    },
    colors: [color],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        shadeIntensity: 0.3,
        gradientToColors: [color],
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 100]
      }
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
      x: { show: false },
      y: {
        formatter: (val: number) => `${val.toFixed(0)} MW`
      }
    },
    grid: {
      show: false,
      padding: { top: 0, right: 0, bottom: 0, left: 0 }
    },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: {
      labels: { show: false },
      min: (min: number) => min * 0.95,
      max: (max: number) => max * 1.05
    }
  }
}

function formatValue(val: number): string {
  if (val >= 1000) {
    return (val / 1000).toFixed(1) + 'k'
  }
  return val.toFixed(0)
}

async function fetchData() {
  const durationHours = props.config?.durationHours || 2
  const endTime = new Date()
  const startTime = new Date(endTime.getTime() - durationHours * 60 * 60 * 1000)

  for (const service of services.value) {
    try {
      const data = await dataService.getStreamPlot(
        service.tag,
        startTime.toISOString(),
        endTime.toISOString(),
        100
      )

      if (data && data.length > 0) {
        service.data = data.map((d: any) => d.Value)
        service.currentValue = data[data.length - 1].Value
      } else {
        // Generate realistic demo data if no data available
        const baseValues: Record<string, number> = {
          'ERCOT.REG_UP': 450,
          'ERCOT.REG_DOWN': 380,
          'ERCOT.RRS': 2800,
          'ERCOT.NON_SPIN': 1500,
          'ERCOT.ECRS': 2300
        }
        const base = baseValues[service.tag] || 500
        service.data = Array.from({ length: 50 }, () => 
          base + (Math.random() - 0.5) * base * 0.3
        )
        service.currentValue = service.data[service.data.length - 1]
      }
    } catch (error) {
      console.error(`Error fetching ${service.name} data:`, error)
      // Generate demo data on error
      const base = 500 + Math.random() * 2000
      service.data = Array.from({ length: 50 }, () => 
        base + (Math.random() - 0.5) * base * 0.2
      )
      service.currentValue = service.data[service.data.length - 1]
    }
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
.ancillary-services-widget {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.service-row {
  display: grid;
  grid-template-columns: minmax(100px, 1fr) 2fr auto;
  align-items: center;
  gap: 12px;
  padding: 6px 10px;
  background: linear-gradient(90deg, 
    rgba(var(--v-theme-surface-bright), 0.3) 0%, 
    transparent 100%);
  border-radius: 6px;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
}

.service-row:hover {
  background: linear-gradient(90deg, 
    rgba(var(--v-theme-primary), 0.1) 0%, 
    transparent 100%);
}

.service-row:nth-child(1) { border-left-color: #00BCD4; }
.service-row:nth-child(2) { border-left-color: #FF9800; }
.service-row:nth-child(3) { border-left-color: #4CAF50; }
.service-row:nth-child(4) { border-left-color: #9C27B0; }
.service-row:nth-child(5) { border-left-color: #2196F3; }

.service-info {
  min-width: 0;
}

.service-name {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.service-sublabel {
  font-size: 0.65rem;
  opacity: 0.6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sparkline-container {
  min-width: 120px;
  max-width: 300px;
  height: 32px;
}

.service-value {
  font-size: 1.1rem;
  font-weight: 700;
  font-family: 'Roboto Mono', monospace;
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

/* Large display optimizations */
@media (min-width: 1920px) {
  .service-row {
    padding: 10px 16px;
    gap: 20px;
  }

  .service-name {
    font-size: 1rem;
  }

  .service-sublabel {
    font-size: 0.75rem;
  }

  .sparkline-container {
    height: 40px;
    min-width: 180px;
  }

  .service-value {
    font-size: 1.4rem;
    min-width: 90px;
  }
}

/* Mobile optimizations */
@media (max-width: 599px) {
  .service-row {
    grid-template-columns: 1fr auto;
    gap: 8px;
    padding: 8px;
  }

  .sparkline-container {
    display: none;
  }

  .service-name {
    font-size: 0.8rem;
  }

  .service-value {
    font-size: 1rem;
  }
}
</style>
