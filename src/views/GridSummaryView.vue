<template>
  <BaseGridView
    title="Grid Summary"
    storage-key="grid-summary-layout"
    :default-layout="defaultLayout"
  />
</template>

<script setup lang="ts">
import BaseGridView from './BaseGridView.vue'
import type { LayoutItem } from '@/composables/useGridLayout'

// ERCOT-themed Color palette - diverse colors, less green dominance
const COLOR_DEMAND = '#42A5F5'    // Blue for demand/load  
const COLOR_CAPACITY = '#26A69A'  // Teal for capacity
const COLOR_RESERVES = '#7E57C2'  // Purple for reserves  
const COLOR_FREQ = '#00E5FF'      // Cyan for frequency
const COLOR_PRICE = '#FFB300'     // Amber for prices
const COLOR_ALERT = '#FF5252'     // Red for alerts/outages

// ERCOT Fuel Mix colors (exact match from ercot.com/gridmktinfo/dashboards/fuelmix)
const COLOR_SOLAR = '#F7931E'     // Orange for Solar
const COLOR_WIND = '#235B97'      // Dark Blue for Wind  
const COLOR_HYDRO = '#00A99D'     // Teal for Hydro
const COLOR_STORAGE = '#BE1E2D'   // Dark Red for Power Storage
const COLOR_OTHER = '#808080'     // Grey for Other
const COLOR_GAS = '#4DB848'       // Green for Natural Gas
const COLOR_COAL = '#754C24'      // Brown for Coal and Lignite
const COLOR_NUCLEAR = '#FDB913'   // Yellow/Gold for Nuclear

// Default layout showcasing ERCOT grid data - optimized for 2K monitors
const defaultLayout: LayoutItem[] = [
  // Row 1: 6 Key stats across the top (reduced height for more density)
  { 
    i: 'freq-stat', x: 0, y: 0, w: 2, h: 3, type: 'stat', 
    title: 'Grid Frequency', 
    config: { tag: 'ERCOT.GRID_FREQ', durationHours: 1, unit: 'Hz', decimals: 3 }, 
    style: { valueColor: COLOR_FREQ } 
  },
  { 
    i: 'demand-stat', x: 2, y: 0, w: 2, h: 3, type: 'stat', 
    title: 'System Demand', 
    config: { tag: 'ERCOT.SYSTEM_LOAD', durationHours: 1, unit: 'MW' }, 
    style: { valueColor: COLOR_DEMAND } 
  },
  { 
    i: 'capacity-stat', x: 4, y: 0, w: 2, h: 3, type: 'stat', 
    title: 'Available Capacity', 
    config: { tag: 'ERCOT.AVAIL_CAPACITY', durationHours: 1, unit: 'MW' }, 
    style: { valueColor: COLOR_CAPACITY } 
  },
  { 
    i: 'reserves-stat', x: 6, y: 0, w: 2, h: 3, type: 'stat', 
    title: 'Operating Reserves', 
    config: { tag: 'ERCOT.OP_RESERVES', durationHours: 1, unit: 'MW' }, 
    style: { valueColor: COLOR_RESERVES } 
  },
  { 
    i: 'price-stat', x: 8, y: 0, w: 2, h: 3, type: 'stat', 
    title: 'RT Hub Price', 
    config: { tag: 'ERCOT.RT_PRICE', durationHours: 1, unit: '$/MWh', decimals: 2 }, 
    style: { valueColor: COLOR_PRICE } 
  },
  { 
    i: 'outages-stat', x: 10, y: 0, w: 2, h: 3, type: 'stat', 
    title: 'Total Outages', 
    config: { tag: 'ERCOT.OUTAGES', durationHours: 1, unit: 'MW' }, 
    style: { valueColor: COLOR_ALERT } 
  },
  
  // Row 2: System load chart (left) and Gauges (right)
  { 
    i: 'load-chart', x: 0, y: 3, w: 8, h: 5, type: 'chart', 
    title: 'System Demand (24h)', 
    config: { tag: 'ERCOT.SYSTEM_LOAD', durationHours: 24 }, 
    style: { valueColor: COLOR_DEMAND } 
  },
  { 
    i: 'reserves-gauge', x: 8, y: 3, w: 2, h: 5, type: 'gauge', 
    title: 'Reserve Margin', 
    config: { tag: 'ERCOT.OP_RESERVES', min: 0, max: 25000, unit: ' MW' }, 
    style: { valueColor: COLOR_RESERVES } 
  },
  { 
    i: 'freq-gauge', x: 10, y: 3, w: 2, h: 5, type: 'gauge', 
    title: 'Frequency', 
    config: { tag: 'ERCOT.GRID_FREQ', min: 59.9, max: 60.1, unit: ' Hz', decimals: 3 }, 
    style: { valueColor: COLOR_FREQ } 
  },
  
  // Row 3: Generation Mix (left) and Ancillary Services (right)
  { 
    i: 'generation-stacked', x: 0, y: 8, w: 8, h: 6, type: 'stacked', 
    title: 'Generation by Fuel Type (24h)', 
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
  },
  { 
    i: 'ancillary-services', x: 8, y: 8, w: 4, h: 6, type: 'ancillary', 
    title: 'Ancillary Services (2h)', 
    config: { durationHours: 2 }, 
    style: {} 
  },
  
  // Row 4: Frequency and Price charts side by side
  { 
    i: 'freq-chart', x: 0, y: 14, w: 6, h: 5, type: 'chart', 
    title: 'Grid Frequency (4h)', 
    config: { tag: 'ERCOT.GRID_FREQ', durationHours: 4, unit: 'Hz' }, 
    style: { valueColor: COLOR_FREQ } 
  },
  { 
    i: 'price-chart', x: 6, y: 14, w: 6, h: 5, type: 'chart', 
    title: 'Real-Time Price (24h)', 
    config: { tag: 'ERCOT.RT_PRICE', durationHours: 24, unit: '$/MWh' }, 
    style: { valueColor: COLOR_PRICE } 
  }
]
</script>
