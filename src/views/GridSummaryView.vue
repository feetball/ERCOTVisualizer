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

// Color constants
const COLOR_MW = '#4CAF50'        // Green for MW values
const COLOR_FREQ = '#00BCD4'      // Teal/Blue-green for frequency
const COLOR_PRICE = '#FF9800'     // Orange for prices
const COLOR_SOLAR = '#FFC107'     // Yellow for solar
const COLOR_WIND = '#03A9F4'      // Light blue for wind
const COLOR_NUCLEAR = '#9C27B0'   // Purple for nuclear
const COLOR_COAL = '#795548'      // Brown for coal
const COLOR_GAS = '#FF5722'       // Deep orange for gas
const COLOR_STORAGE = '#E91E63'   // Pink for storage

// Default layout showcasing ERCOT grid data
const defaultLayout: LayoutItem[] = [
  // Row 1: Key stats at the top
  { 
    i: 'freq-stat', x: 0, y: 0, w: 3, h: 4, type: 'stat', 
    title: 'Grid Frequency', 
    config: { tag: 'ERCOT.GRID_FREQ', durationHours: 1, unit: 'Hz', decimals: 2 }, 
    style: { valueColor: COLOR_FREQ } 
  },
  { 
    i: 'demand-stat', x: 3, y: 0, w: 3, h: 4, type: 'stat', 
    title: 'System Demand', 
    config: { tag: 'ERCOT.SYSTEM_LOAD', durationHours: 1, unit: 'MW', decimals: 2 }, 
    style: { valueColor: COLOR_MW } 
  },
  { 
    i: 'capacity-stat', x: 6, y: 0, w: 3, h: 4, type: 'stat', 
    title: 'Available Capacity', 
    config: { tag: 'ERCOT.AVAIL_CAPACITY', durationHours: 1, unit: 'MW', decimals: 2 }, 
    style: { valueColor: COLOR_MW } 
  },
  { 
    i: 'reserves-stat', x: 9, y: 0, w: 3, h: 4, type: 'stat', 
    title: 'Operating Reserves', 
    config: { tag: 'ERCOT.OP_RESERVES', durationHours: 1, unit: 'MW', decimals: 2 }, 
    style: { valueColor: COLOR_MW } 
  },
  
  // Row 2: Price and Outages
  { 
    i: 'price-stat', x: 0, y: 4, w: 3, h: 4, type: 'stat', 
    title: 'RT Hub Price', 
    config: { tag: 'ERCOT.RT_PRICE', durationHours: 1, unit: '$/MWh', decimals: 2 }, 
    style: { valueColor: COLOR_PRICE } 
  },
  { 
    i: 'outages-stat', x: 3, y: 4, w: 3, h: 4, type: 'stat', 
    title: 'Total Outages', 
    config: { tag: 'ERCOT.OUTAGES', durationHours: 1, unit: 'MW', decimals: 2 }, 
    style: { valueColor: '#F44336' } 
  },
  { 
    i: 'reserves-gauge', x: 6, y: 4, w: 3, h: 4, type: 'gauge', 
    title: 'Reserve Margin', 
    config: { tag: 'ERCOT.OP_RESERVES', min: 0, max: 25000, unit: ' MW', decimals: 2 }, 
    style: { valueColor: COLOR_MW } 
  },
  { 
    i: 'freq-gauge', x: 9, y: 4, w: 3, h: 4, type: 'gauge', 
    title: 'Frequency', 
    config: { tag: 'ERCOT.GRID_FREQ', min: 59.9, max: 60.1, unit: ' Hz', decimals: 2 }, 
    style: { valueColor: COLOR_FREQ } 
  },
  
  // Row 3: System load chart spanning full width
  { 
    i: 'load-chart', x: 0, y: 8, w: 12, h: 6, type: 'chart', 
    title: 'System Demand (24h)', 
    config: { tag: 'ERCOT.SYSTEM_LOAD', durationHours: 24 }, 
    style: { valueColor: COLOR_MW } 
  },
  
  // Row 4: Stacked Generation Mix Chart
  { 
    i: 'generation-stacked', x: 0, y: 14, w: 12, h: 8, type: 'stacked', 
    title: 'Generation by Fuel Type (24h)', 
    config: { 
      durationHours: 24,
      unit: 'MW',
      tags: [
        { tag: 'ERCOT.WIND_GEN', name: 'Wind', color: COLOR_WIND },
        { tag: 'ERCOT.SOLAR_GEN', name: 'Solar', color: COLOR_SOLAR },
        { tag: 'ERCOT.GAS_GEN', name: 'Natural Gas', color: COLOR_GAS },
        { tag: 'ERCOT.NUCLEAR_GEN', name: 'Nuclear', color: COLOR_NUCLEAR },
        { tag: 'ERCOT.COAL_GEN', name: 'Coal', color: COLOR_COAL },
        { tag: 'ERCOT.STORAGE_NET', name: 'Storage', color: COLOR_STORAGE }
      ]
    }, 
    style: {} 
  },
  
  // Row 5: Frequency and Price charts
  { 
    i: 'freq-chart', x: 0, y: 22, w: 6, h: 6, type: 'chart', 
    title: 'Grid Frequency (4h)', 
    config: { tag: 'ERCOT.GRID_FREQ', durationHours: 4, unit: 'Hz' }, 
    style: { valueColor: COLOR_FREQ } 
  },
  { 
    i: 'price-chart', x: 6, y: 22, w: 6, h: 6, type: 'chart', 
    title: 'Real-Time Price (24h)', 
    config: { tag: 'ERCOT.RT_PRICE', durationHours: 24, unit: '$/MWh' }, 
    style: { valueColor: COLOR_PRICE } 
  }
]
</script>
