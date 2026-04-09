/**
 * Design Tokens
 * Energy-themed palette and design constants for the ERCOT Visualizer.
 * Used by components and ECharts themes.
 */

export const ENERGY_PALETTE = {
  cyan: {
    50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9',
    400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490',
    800: '#155e75', 900: '#164e63',
  },
  green: {
    50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
    400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
    800: '#166534', 900: '#14532d',
  },
  amber: {
    50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
    400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
    800: '#92400e', 900: '#78350f',
  },
  red: {
    50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
    400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
    800: '#991b1b', 900: '#7f1d1d',
  },
  purple: {
    50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd',
    400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9',
    800: '#5b21b6', 900: '#4c1d95',
  },
} as const

/** Chart series colors — vibrant, high-contrast on dark backgrounds */
export const CHART_COLORS = {
  primary: '#06b6d4',    // cyan-500
  secondary: '#22c55e',  // green-500
  tertiary: '#8b5cf6',   // purple-500
  quaternary: '#f59e0b', // amber-500
  quinary: '#ef4444',    // red-500
  senary: '#ec4899',     // pink-500
} as const

/** Fuel type colors (matching existing COLORS but refined) */
export const FUEL_COLORS = {
  solar: '#f59e0b',
  wind: '#3b82f6',
  hydro: '#06b6d4',
  gas: '#8b5cf6',
  coal: '#475569',
  nuclear: '#eab308',
  storage: '#22c55e',
  other: '#6b7280',
} as const

/** Status/severity colors */
export const STATUS_COLORS = {
  normal: '#22c55e',
  caution: '#f59e0b',
  warning: '#f97316',
  alert: '#ef4444',
  info: '#06b6d4',
} as const

/** Dark theme surface colors */
export const DARK_SURFACES = {
  background: '#0a0e1a',
  surface: '#141926',
  elevated: '#1c2233',
  overlay: '#242d40',
  border: '#2a3548',
  borderSubtle: '#1e2738',
} as const

/** Light theme surface colors */
export const LIGHT_SURFACES = {
  background: '#f8fafc',
  surface: '#ffffff',
  elevated: '#f1f5f9',
  overlay: '#e2e8f0',
  border: '#cbd5e1',
  borderSubtle: '#e2e8f0',
} as const
