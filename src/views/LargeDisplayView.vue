<template>
  <BaseGridView
    title="Large Display"
    storage-key="large-display-layout"
    :default-layout="defaultLayout"
    :allow-edit="false"
  />
</template>

<script setup lang="ts">
import BaseGridView from './BaseGridView.vue'
import type { LayoutItem } from '@/composables/useGridLayout'
import { COLORS } from '@/styles/colors'

// Large display layout - optimized for TV/wall displays
// Bigger widgets, fewer items, high visibility
const defaultLayout: LayoutItem[] = [
  // Top row: 4 key metrics - large and prominent
  { 
    i: 'demand-big', x: 0, y: 0, w: 3, h: 5, type: 'stat', 
    title: 'System Demand', 
    config: { tag: 'ERCOT.SYSTEM_LOAD', durationHours: 1, unit: 'MW' }, 
    style: { valueColor: COLORS.DEMAND } 
  },
  { 
    i: 'capacity-big', x: 3, y: 0, w: 3, h: 5, type: 'stat', 
    title: 'Available Capacity', 
    config: { tag: 'ERCOT.AVAIL_CAPACITY', durationHours: 1, unit: 'MW' }, 
    style: { valueColor: COLORS.CAPACITY } 
  },
  { 
    i: 'reserves-big', x: 6, y: 0, w: 3, h: 5, type: 'stat', 
    title: 'Operating Reserves', 
    config: { tag: 'ERCOT.OP_RESERVES', durationHours: 1, unit: 'MW' }, 
    style: { valueColor: COLORS.RESERVES } 
  },
  { 
    i: 'freq-big', x: 9, y: 0, w: 3, h: 5, type: 'stat', 
    title: 'Grid Frequency', 
    config: { tag: 'ERCOT.GRID_FREQ', durationHours: 1, unit: 'Hz', decimals: 2 }, 
    style: { valueColor: COLORS.FREQUENCY } 
  },

  // Second row: Price, Outages, and Gauges
  { 
    i: 'price-big', x: 0, y: 5, w: 3, h: 5, type: 'stat', 
    title: 'Real-Time Price', 
    config: { tag: 'ERCOT.RT_PRICE', durationHours: 1, unit: '$/MWh', decimals: 2 }, 
    style: { valueColor: COLORS.PRICE } 
  },
  { 
    i: 'outages-big', x: 3, y: 5, w: 3, h: 5, type: 'stat', 
    title: 'Total Outages', 
    config: { tag: 'ERCOT.OUTAGES', durationHours: 1, unit: 'MW' }, 
    style: { valueColor: COLORS.ALERT } 
  },
  { 
    i: 'reserves-gauge', x: 6, y: 5, w: 3, h: 5, type: 'gauge', 
    title: 'Reserve Margin', 
    config: { tag: 'ERCOT.OP_RESERVES', min: 0, max: 30000, unit: ' MW' }, 
    style: { valueColor: COLORS.RESERVES } 
  },
  { 
    i: 'freq-gauge', x: 9, y: 5, w: 3, h: 5, type: 'gauge', 
    title: 'Grid Frequency', 
    config: { tag: 'ERCOT.GRID_FREQ', min: 59.9, max: 60.1, unit: ' Hz', decimals: 3 }, 
    style: { valueColor: COLORS.FREQUENCY } 
  },

  // Third row: Full-width demand chart
  { 
    i: 'demand-chart', x: 0, y: 10, w: 12, h: 7, type: 'chart', 
    title: 'System Demand - Last 24 Hours', 
    config: { tag: 'ERCOT.SYSTEM_LOAD', durationHours: 24, unit: 'MW' }, 
    style: { valueColor: COLORS.DEMAND } 
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
        { tag: 'ERCOT.SOLAR_GEN', name: 'Solar', color: COLORS.SOLAR },
        { tag: 'ERCOT.WIND_GEN', name: 'Wind', color: COLORS.WIND },
        { tag: 'ERCOT.HYDRO_GEN', name: 'Hydro', color: COLORS.HYDRO },
        { tag: 'ERCOT.STORAGE_NET', name: 'Storage', color: COLORS.STORAGE },
        { tag: 'ERCOT.OTHER_GEN', name: 'Other', color: COLORS.OTHER },
        { tag: 'ERCOT.GAS_GEN', name: 'Natural Gas', color: COLORS.NATURAL_GAS },
        { tag: 'ERCOT.COAL_GEN', name: 'Coal', color: COLORS.COAL },
        { tag: 'ERCOT.NUCLEAR_GEN', name: 'Nuclear', color: COLORS.NUCLEAR }
      ]
    }, 
    style: {} 
  }
]
</script>
