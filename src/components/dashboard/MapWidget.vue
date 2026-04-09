<template>
  <div class="map-widget">
    <div class="map-controls">
      <select
        v-model="selectedMetric"
        class="metric-select"
      >
        <option value="load">Load (MW)</option>
        <option value="windGen">Wind (MW)</option>
        <option value="solarGen">Solar (MW)</option>
        <option value="gasGen">Gas (MW)</option>
        <option value="price">Price ($/MWh)</option>
      </select>
    </div>
    <div class="map-chart" ref="chartEl"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts/core'
import { useECharts, type EChartsOption } from '@/composables/useECharts'
import { TOOLTIP_STYLE, ANIMATION_DEFAULTS } from '@/styles/echarts-theme'
import { generateRegionData, type RegionData } from '@/services/ercotService'
import { WIDGET_REFRESH_INTERVAL } from '@/types/widget'
import type { WidgetConfig, WidgetStyle } from '@/types/widget'
import geoJson from '@/assets/geo/texas-ercot-regions.json'

defineProps<{
  config?: WidgetConfig
  styleConfig?: WidgetStyle
}>()

const chartEl = ref<HTMLElement | null>(null)
const selectedMetric = ref<keyof RegionData>('load')
const regionData = ref<RegionData[]>([])
let intervalId: ReturnType<typeof setInterval> | null = null

// Register the map on module load
echarts.registerMap('texas-ercot', geoJson as unknown as Parameters<typeof echarts.registerMap>[1])

const { setOption } = useECharts(chartEl)

// Power flow lines between regions (approximate center points)
const regionCenters: Record<string, [number, number]> = {
  west:    [-102.0, 32.5],
  north:   [-97.0, 33.0],
  east:    [-94.3, 31.5],
  houston: [-95.3, 30.0],
  south:   [-97.2, 29.5],
  coast:   [-94.8, 28.2],
}

const flowPaths = [
  { from: 'west', to: 'north' },
  { from: 'west', to: 'south' },
  { from: 'north', to: 'houston' },
  { from: 'north', to: 'east' },
  { from: 'south', to: 'houston' },
  { from: 'south', to: 'coast' },
]

function getColorRange(): [string, string] {
  switch (selectedMetric.value) {
    case 'load':     return ['#164e63', '#06b6d4']
    case 'windGen':  return ['#1e3a5f', '#3b82f6']
    case 'solarGen': return ['#451a03', '#f59e0b']
    case 'gasGen':   return ['#2e1065', '#8b5cf6']
    case 'price':    return ['#14532d', '#22c55e']
    default:         return ['#164e63', '#06b6d4']
  }
}

function formatMetricValue(val: number): string {
  if (selectedMetric.value === 'price') return `$${val.toFixed(2)}`
  return Math.round(val).toLocaleString() + ' MW'
}

function buildOption(): EChartsOption {
  const data = regionData.value
  if (!data.length) return {}

  const mapData = data.map(r => ({
    name: r.name,
    value: r[selectedMetric.value] as number,
  }))

  const values = mapData.map(d => d.value)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const [colorLow, colorHigh] = getColorRange()

  // Animated flow lines
  const linesData = flowPaths.map(p => ({
    coords: [regionCenters[p.from], regionCenters[p.to]],
  }))

  return {
    ...ANIMATION_DEFAULTS,
    tooltip: {
      ...TOOLTIP_STYLE,
      trigger: 'item',
      formatter: (params: unknown) => {
        const p = params as { name?: string; value?: number; seriesType?: string }
        if (p.seriesType !== 'map' || !p.name) return ''
        const region = data.find(r => r.name === p.name)
        if (!region) return ''
        return `
          <div style="font-weight:600;font-size:13px;margin-bottom:4px">${region.name}</div>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:2px 8px;font-size:11px">
            <span style="opacity:0.6">Load:</span><span>${Math.round(region.load).toLocaleString()} MW</span>
            <span style="opacity:0.6">Wind:</span><span>${Math.round(region.windGen).toLocaleString()} MW</span>
            <span style="opacity:0.6">Solar:</span><span>${Math.round(region.solarGen).toLocaleString()} MW</span>
            <span style="opacity:0.6">Gas:</span><span>${Math.round(region.gasGen).toLocaleString()} MW</span>
            <span style="opacity:0.6">Price:</span><span>$${region.price.toFixed(2)}/MWh</span>
          </div>
        `
      },
    },
    visualMap: {
      min: minVal,
      max: maxVal,
      text: [formatMetricValue(maxVal), formatMetricValue(minVal)],
      realtime: false,
      calculable: false,
      inRange: { color: [colorLow, colorHigh] },
      textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
      right: 10,
      bottom: 10,
      orient: 'vertical',
      itemWidth: 12,
      itemHeight: 80,
    },
    geo: {
      map: 'texas-ercot',
      roam: false,
      zoom: 1.0,
      center: [-99.0, 31.2],
      itemStyle: {
        areaColor: 'rgba(255,255,255,0.03)',
        borderColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
      },
      emphasis: {
        disabled: true,
      },
      silent: true,
    },
    series: [
      {
        type: 'map',
        map: 'texas-ercot',
        geoIndex: 0,
        roam: false,
        data: mapData,
        label: {
          show: true,
          color: 'rgba(255,255,255,0.85)',
          fontSize: 10,
          fontWeight: 600,
          formatter: (p: { name: string }) => p.name,
        },
        emphasis: {
          label: { fontSize: 12 },
          itemStyle: {
            areaColor: undefined,
            borderColor: '#06b6d4',
            borderWidth: 2,
            shadowBlur: 20,
            shadowColor: 'rgba(6,182,212,0.4)',
          },
        },
        select: { disabled: true },
      },
      // Animated flow lines
      {
        type: 'lines',
        coordinateSystem: 'geo',
        zlevel: 2,
        effect: {
          show: true,
          period: 4,
          trailLength: 0.3,
          symbol: 'arrow',
          symbolSize: 5,
          color: '#06b6d4',
        },
        lineStyle: {
          color: 'rgba(6,182,212,0.15)',
          width: 1.5,
          curveness: 0.2,
        },
        data: linesData,
        silent: true,
      },
      // Region center dots (glow effect)
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 3,
        rippleEffect: {
          brushType: 'stroke',
          scale: 3,
          period: 3,
        },
        symbol: 'circle',
        symbolSize: (val: number) => Math.max(6, Math.min(18, val / (maxVal / 15))),
        itemStyle: {
          color: '#06b6d4',
          shadowBlur: 10,
          shadowColor: 'rgba(6,182,212,0.5)',
        },
        data: mapData.map(d => {
          const region = data.find(r => r.name === d.name)
          const center = regionCenters[region?.id || 'north']
          return {
            name: d.name,
            value: [...center, d.value],
          }
        }),
        silent: true,
      },
    ],
  }
}

function fetchData() {
  regionData.value = generateRegionData(new Date())
  setOption(buildOption(), true)
}

onMounted(() => {
  fetchData()
  intervalId = setInterval(fetchData, WIDGET_REFRESH_INTERVAL * 2)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})

// Re-render when metric changes
import { watch } from 'vue'
watch(selectedMetric, () => {
  setOption(buildOption(), true)
})
</script>

<style scoped>
.map-widget {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

.map-controls {
  position: absolute;
  top: 4px;
  left: 8px;
  z-index: 10;
}

.metric-select {
  background: hsla(var(--card), 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid hsla(var(--border), 0.5);
  border-radius: 6px;
  color: hsl(var(--foreground));
  font-size: 11px;
  font-weight: 500;
  padding: 4px 8px;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.metric-select:focus {
  border-color: hsl(var(--primary));
}

.metric-select option {
  background: hsl(var(--card));
  color: hsl(var(--foreground));
}

.map-chart {
  flex: 1;
  min-height: 0;
}
</style>
