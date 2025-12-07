/**
 * Global Color Definitions
 * Centralized color palette for OpsTools3 / ERCOT Visualizer
 * 
 * Usage: import { COLORS } from '@/styles/colors'
 * 
 * These colors are also available as CSS variables in colors.css
 */

export const COLORS = {
  // Fuel Type / Generation Colors
  MW: '#6dcc84',           // MW - Green
  SOLAR: '#cf6a20',        // Solar - Orange
  WIND: '#2f67af',         // Wind - Blue
  HYDRO: '#4a97ad',        // Hydro - Teal/Cyan
  NATURAL_GAS: '#4d4b98',  // Natural Gas - Purple
  COAL: '#183a62',         // Coal - Dark Blue
  NUCLEAR: '#ecca3e',      // Nuclear - Yellow/Gold
  STORAGE: '#ecca3e',      // ESR/Storage - Yellow/Gold
  OTHER: '#808080',        // Other - Grey

  // Metrics & Indicators Colors
  DEMAND: '#5ab3c3',       // Demand - Cyan
  FREQUENCY: '#5ab3c3',    // Frequency - Cyan
  ANCILLARY: '#6552a2',    // Ancillary Services - Purple

  // Additional Utility Colors
  CAPACITY: '#26A69A',     // Capacity - Teal
  RESERVES: '#7E57C2',     // Reserves - Purple
  PRICE: '#FFB300',        // Price - Amber
  ALERT: '#FF5252',        // Alerts - Red

  // Demand Severity Thresholds
  DEMAND_HIGH: '#FF5252',    // High demand (>=50k) - Red
  DEMAND_MEDIUM: '#FFB300',  // Medium demand (45-50k) - Amber
  DEMAND_LOW: '#4DB848',     // Low demand (<45k) - Green
} as const

export type ColorKey = keyof typeof COLORS

// Helper to get CSS variable name from color key
export function getCssVar(key: ColorKey): string {
  const cssVarMap: Record<ColorKey, string> = {
    MW: '--color-mw',
    SOLAR: '--color-solar',
    WIND: '--color-wind',
    HYDRO: '--color-hydro',
    NATURAL_GAS: '--color-natural-gas',
    COAL: '--color-coal',
    NUCLEAR: '--color-nuclear',
    STORAGE: '--color-storage',
    OTHER: '--color-other',
    DEMAND: '--color-demand',
    FREQUENCY: '--color-frequency',
    ANCILLARY: '--color-ancillary',
    CAPACITY: '--color-capacity',
    RESERVES: '--color-reserves',
    PRICE: '--color-price',
    ALERT: '--color-alert',
    DEMAND_HIGH: '--color-demand-high',
    DEMAND_MEDIUM: '--color-demand-medium',
    DEMAND_LOW: '--color-demand-low',
  }
  return cssVarMap[key]
}
