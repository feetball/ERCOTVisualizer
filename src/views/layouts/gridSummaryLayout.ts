import type { LayoutItem } from '@/composables/useGridLayout'
import { COLORS } from '@/styles/colors'

// Default layout showcasing ERCOT grid data - optimized for 2K monitors
export const gridSummaryLayout: LayoutItem[] = [
  // Row 0: Alert indicators across the top (4 alerts)
  { 
    i: 'freq-alert', x: 0, y: 0, w: 1, h: 2, type: 'alert', 
    title: 'Freq', 
    config: { tag: 'ERCOT.GRID_FREQ', unit: 'Hz', decimals: 3, showLabel: true }, 
    style: {} 
  },
  { 
    i: 'reserves-alert', x: 1, y: 0, w: 1, h: 2, type: 'alert', 
    title: 'Reserves', 
    config: { tag: 'ERCOT.OP_RESERVES', unit: 'MW', showLabel: true }, 
    style: {} 
  },
  { 
    i: 'demand-alert', x: 2, y: 0, w: 1, h: 2, type: 'alert', 
    title: 'Load', 
    config: { tag: 'ERCOT.SYSTEM_LOAD', unit: 'MW', showLabel: true }, 
    style: {} 
  },
  { 
    i: 'price-alert', x: 3, y: 0, w: 1, h: 2, type: 'alert', 
    title: 'Price', 
    config: { tag: 'ERCOT.RT_PRICE', unit: '$', decimals: 0, showLabel: true }, 
    style: {} 
  },
  
  // Row 0: Key stats (next to alerts)
  { 
    i: 'freq-stat', x: 4, y: 0, w: 2, h: 4, type: 'stat', 
    title: 'Grid Frequency', 
    config: { tag: 'ERCOT.GRID_FREQ', durationHours: 1, unit: 'Hz', decimals: 3 }, 
    style: { valueColor: COLORS.FREQUENCY } 
  },
  { 
    i: 'demand-stat', x: 6, y: 0, w: 2, h: 4, type: 'stat', 
    title: 'System Demand', 
    config: { tag: 'ERCOT.SYSTEM_LOAD', durationHours: 1, unit: 'MW' }, 
    style: { valueColor: COLORS.DEMAND } 
  },
  { 
    i: 'capacity-stat', x: 8, y: 0, w: 2, h: 4, type: 'stat', 
    title: 'Available Capacity', 
    config: { tag: 'ERCOT.AVAIL_CAPACITY', durationHours: 1, unit: 'MW' }, 
    style: { valueColor: COLORS.CAPACITY } 
  },
  { 
    i: 'reserves-stat', x: 10, y: 0, w: 2, h: 4, type: 'stat', 
    title: 'Operating Reserves', 
    config: { tag: 'ERCOT.OP_RESERVES', durationHours: 1, unit: 'MW' }, 
    style: { valueColor: COLORS.RESERVES } 
  },
  
  // Row 1: More stats below alerts
  { 
    i: 'price-stat', x: 0, y: 2, w: 2, h: 4, type: 'stat', 
    title: 'RT Hub Price', 
    config: { tag: 'ERCOT.RT_PRICE', durationHours: 1, unit: '$', decimals: 2 }, 
    style: { valueColor: COLORS.PRICE } 
  },
  { 
    i: 'outages-stat', x: 2, y: 2, w: 2, h: 4, type: 'stat', 
    title: 'Total Outages', 
    config: { tag: 'ERCOT.OUTAGES', durationHours: 1, unit: 'MW' }, 
    style: { valueColor: COLORS.ALERT } 
  },
  
  // Row 2: System Demand chart (wide) 
  { 
    i: 'load-chart', x: 4, y: 4, w: 8, h: 6, type: 'chart', 
    title: 'System Demand (24h)', 
    config: { tag: 'ERCOT.SYSTEM_LOAD', durationHours: 24 }, 
    style: { valueColor: COLORS.DEMAND } 
  },
  
  // Row 2: Gauges (left side)
  { 
    i: 'reserves-gauge', x: 0, y: 6, w: 2, h: 4, type: 'gauge', 
    title: 'Reserve Margin', 
    config: { tag: 'ERCOT.OP_RESERVES', min: 0, max: 25000, unit: ' MW' }, 
    style: { valueColor: COLORS.RESERVES } 
  },
  { 
    i: 'freq-gauge', x: 2, y: 6, w: 2, h: 4, type: 'gauge', 
    title: 'Frequency', 
    config: { tag: 'ERCOT.GRID_FREQ', min: 59.9, max: 60.1, unit: ' Hz', decimals: 3 }, 
    style: { valueColor: COLORS.FREQUENCY } 
  },
  
  // Row 3: Generation Mix (wide, left) and Ancillary Services (right)
  { 
    i: 'generation-stacked', x: 0, y: 10, w: 8, h: 7, type: 'stacked', 
    title: 'Generation by Fuel Type (24h)', 
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
  },
  { 
    i: 'ancillary-services', x: 8, y: 10, w: 4, h: 7, type: 'ancillary', 
    title: 'Ancillary Services (2h)', 
    config: { durationHours: 2 }, 
    style: {} 
  },
  
  // Row 4: Frequency and Price charts side by side
  { 
    i: 'freq-chart', x: 0, y: 17, w: 6, h: 5, type: 'chart', 
    title: 'Grid Frequency (4h)', 
    config: { tag: 'ERCOT.GRID_FREQ', durationHours: 4, unit: 'Hz' }, 
    style: { valueColor: COLORS.FREQUENCY } 
  },
  { 
    i: 'price-chart', x: 6, y: 17, w: 6, h: 5, type: 'chart', 
    title: 'Real-Time Price (24h)', 
    config: { tag: 'ERCOT.RT_PRICE', durationHours: 24, unit: '$', decimals: 2 }, 
    style: { valueColor: COLORS.PRICE } 
  }
]
