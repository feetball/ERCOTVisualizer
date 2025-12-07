<template>
  <BaseGridView
    title="Large Display"
    storage-key="large-display-layout"
    :default-layout="defaultLayout"
  />
</template>

<script setup lang="ts">
import BaseGridView from './BaseGridView.vue'
import type { LayoutItem } from '@/composables/useGridLayout'

// Color palette for large display - high contrast for visibility
const COLOR_FREQ = '#00E5FF'      // Cyan for frequency
const COLOR_DEMAND = '#42A5F5'    // Blue for demand
const COLOR_CAPACITY = '#26A69A'  // Teal for capacity
const COLOR_RESERVES = '#7E57C2'  // Purple for reserves
const COLOR_PRICE = '#FFB300'     // Amber for prices
const COLOR_ALERT = '#FF5252'     // Red for alerts

// ERCOT Fuel Mix colors (exact match from ercot.com/gridmktinfo/dashboards/fuelmix)
const COLOR_SOLAR = '#F7931E'     // Orange for Solar
const COLOR_WIND = '#235B97'      // Dark Blue for Wind  
const COLOR_HYDRO = '#00A99D'     // Teal for Hydro
const COLOR_STORAGE = '#BE1E2D'   // Dark Red for Power Storage
const COLOR_OTHER = '#808080'     // Grey for Other
const COLOR_GAS = '#4DB848'       // Green for Natural Gas
const COLOR_COAL = '#754C24'      // Brown for Coal and Lignite
const COLOR_NUCLEAR = '#FDB913'   // Yellow/Gold for Nuclear

// Large display layout - optimized for TV/wall displays
// Bigger widgets, fewer items, high visibility
const defaultLayout: LayoutItem[] = [
  // Top row: 4 key metrics - large and prominent
  { 
    i: 'demand-big', x: 0, y: 0, w: 3, h: 5, type: 'stat', 
    title: 'System Demand', 
    config: { tag: 'ERCOT.SYSTEM_LOAD', durationHours: 1, unit: 'MW' }, 
    style: { valueColor: COLOR_DEMAND } 
  },
  { 
    i: 'capacity-big', x: 3, y: 0, w: 3, h: 5, type: 'stat', 
    title: 'Available Capacity', 
    config: { tag: 'ERCOT.AVAIL_CAPACITY', durationHours: 1, unit: 'MW' }, 
    style: { valueColor: COLOR_CAPACITY } 
  },
  { 
    i: 'reserves-big', x: 6, y: 0, w: 3, h: 5, type: 'stat', 
    title: 'Operating Reserves', 
    config: { tag: 'ERCOT.OP_RESERVES', durationHours: 1, unit: 'MW' }, 
    style: { valueColor: COLOR_RESERVES } 
  },
  { 
    i: 'freq-big', x: 9, y: 0, w: 3, h: 5, type: 'stat', 
    title: 'Grid Frequency', 
    config: { tag: 'ERCOT.GRID_FREQ', durationHours: 1, unit: 'Hz', decimals: 2 }, 
    style: { valueColor: COLOR_FREQ } 
  },

  // Second row: Price, Outages, and Gauges
  { 
    i: 'price-big', x: 0, y: 5, w: 3, h: 5, type: 'stat', 
    title: 'Real-Time Price', 
    config: { tag: 'ERCOT.RT_PRICE', durationHours: 1, unit: '$/MWh', decimals: 2 }, 
    style: { valueColor: COLOR_PRICE } 
  },
  { 
    i: 'outages-big', x: 3, y: 5, w: 3, h: 5, type: 'stat', 
    title: 'Total Outages', 
    config: { tag: 'ERCOT.OUTAGES', durationHours: 1, unit: 'MW' }, 
    style: { valueColor: COLOR_ALERT } 
  },
  { 
    i: 'reserves-gauge', x: 6, y: 5, w: 3, h: 5, type: 'gauge', 
    title: 'Reserve Margin', 
    config: { tag: 'ERCOT.OP_RESERVES', min: 0, max: 30000, unit: ' MW' }, 
    style: { valueColor: COLOR_RESERVES } 
  },
  { 
    i: 'freq-gauge', x: 9, y: 5, w: 3, h: 5, type: 'gauge', 
    title: 'Grid Frequency', 
    config: { tag: 'ERCOT.GRID_FREQ', min: 59.9, max: 60.1, unit: ' Hz', decimals: 3 }, 
    style: { valueColor: COLOR_FREQ } 
  },

  // Third row: Full-width demand chart
  { 
    i: 'demand-chart', x: 0, y: 10, w: 12, h: 7, type: 'chart', 
    title: 'System Demand - Last 24 Hours', 
    config: { tag: 'ERCOT.SYSTEM_LOAD', durationHours: 24, unit: 'MW' }, 
    style: { valueColor: COLOR_DEMAND } 
  },

  // Fourth row: Ancillary Services and Generation mix
  { 
    i: 'ancillary-services', x: 0, y: 17, w: 4, h: 9, type: 'ancillary', 
    title: 'Ancillary Services', 
    config: { durationHours: 2 }, 
    style: {} 
  },
  { 
    i: 'gen-stacked', x: 4, y: 17, w: 8, h: 9, type: 'stacked', 
    title: 'Generation by Fuel Type - Last 24 Hours', 
    config: { 
      durationHours: 24,
      unit: 'MW',
      tags: [
        { tag: 'ERCOT.SOLAR_GEN', name: 'Solar', color: COLOR_SOLAR },
        { tag: 'ERCOT.WIND_GEN', name: 'Wind', color: COLOR_WIND },
        { tag: 'ERCOT.HYDRO_GEN', name: 'Hydro', color: COLOR_HYDRO },
        { tag: 'ERCOT.STORAGE_NET', name: 'Storage', color: COLOR_STORAGE },
        { tag: 'ERCOT.OTHER_GEN', name: 'Other', color: COLOR_OTHER },
        { tag: 'ERCOT.GAS_GEN', name: 'Natural Gas', color: COLOR_GAS },
        { tag: 'ERCOT.COAL_GEN', name: 'Coal', color: COLOR_COAL },
        { tag: 'ERCOT.NUCLEAR_GEN', name: 'Nuclear', color: COLOR_NUCLEAR }
      ]
    }, 
    style: {} 
  }
]
</script>
