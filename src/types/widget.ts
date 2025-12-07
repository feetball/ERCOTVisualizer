/**
 * Widget Configuration Types
 * 
 * Centralized type definitions for all widget configurations
 */

/** Standard refresh interval in milliseconds */
export const WIDGET_REFRESH_INTERVAL = 5000

/** Tag configuration for multi-series charts */
export interface TagConfig {
  tag: string
  name?: string
  color?: string
}

/** Base configuration shared by all widgets */
export interface BaseWidgetConfig {
  tag: string
  durationHours?: number
  label?: string
  unit?: string
  decimals?: number
  calculation?: string
  min?: number
  max?: number
}

/** Configuration for value/stat widgets */
export interface ValueWidgetConfig extends BaseWidgetConfig {}

/** Configuration for gauge widgets */
export interface GaugeWidgetConfig extends BaseWidgetConfig {}

/** Configuration for chart widgets */
export interface ChartWidgetConfig extends BaseWidgetConfig {}

/** Configuration for stacked chart widgets */
export interface StackedChartWidgetConfig {
  tags: TagConfig[]
  durationHours?: number
  unit?: string
}

/** Configuration for table widgets */
export interface TableWidgetConfig extends BaseWidgetConfig {}

/** Union type for all widget configs - flexible to handle all widget types */
export interface WidgetConfig {
  tag?: string
  tags?: TagConfig[]
  durationHours?: number
  label?: string
  unit?: string
  decimals?: number
  calculation?: string
  min?: number
  max?: number
  showLabel?: boolean
  thresholds?: AlertThreshold[]
  invertLogic?: boolean
}

/** Alert threshold configuration */
export interface AlertThreshold {
  level: 'normal' | 'caution' | 'warning' | 'alert'
  min?: number
  max?: number
}

/** Widget styling options */
export interface WidgetStyle {
  titleColor?: string
  titleSize?: string
  backgroundColor?: string
  valueColor?: string
}

/** Widget types supported by the application */
export type WidgetType = 'chart' | 'value' | 'stat' | 'gauge' | 'table' | 'stacked' | 'ancillary' | 'alert'

/** Layout item for grid-layout-plus */
export interface LayoutItem {
  i: string
  x: number
  y: number
  w: number
  h: number
  type: WidgetType
  title: string
  config: WidgetConfig
  style?: WidgetStyle
}

/**
 * Safe calculation evaluator
 * 
 * Instead of using new Function() which is equivalent to eval(),
 * this provides a safe set of predefined transformations.
 */
export type CalculationType = 
  | 'none'
  | 'multiply'
  | 'divide'
  | 'add'
  | 'subtract'
  | 'percentage'
  | 'round'
  | 'abs'

export interface SafeCalculation {
  type: CalculationType
  value?: number
}

/**
 * Safely evaluate a calculation on a value
 * This replaces the dangerous new Function() pattern
 */
export function safeCalculate(value: number, calculation?: string | SafeCalculation): number {
  if (!calculation) return value
  
  // If it's the new safe format
  if (typeof calculation === 'object') {
    const calc = calculation as SafeCalculation
    switch (calc.type) {
      case 'multiply':
        return value * (calc.value ?? 1)
      case 'divide':
        return calc.value ? value / calc.value : value
      case 'add':
        return value + (calc.value ?? 0)
      case 'subtract':
        return value - (calc.value ?? 0)
      case 'percentage':
        return calc.value ? (value / calc.value) * 100 : value
      case 'round':
        return Math.round(value * (calc.value ?? 1)) / (calc.value ?? 1)
      case 'abs':
        return Math.abs(value)
      case 'none':
      default:
        return value
    }
  }
  
  // Legacy string format - parse simple expressions only
  // Supports: "value * 2", "value / 100", "value + 10", "value - 5"
  const trimmed = calculation.trim()
  
  // Simple multiply: "value * N" or "* N"
  const multiplyMatch = trimmed.match(/^(?:value\s*)?\*\s*(-?\d+(?:\.\d+)?)$/)
  if (multiplyMatch) {
    return value * parseFloat(multiplyMatch[1])
  }
  
  // Simple divide: "value / N" or "/ N"
  const divideMatch = trimmed.match(/^(?:value\s*)?\/\s*(-?\d+(?:\.\d+)?)$/)
  if (divideMatch) {
    const divisor = parseFloat(divideMatch[1])
    return divisor !== 0 ? value / divisor : value
  }
  
  // Simple add: "value + N" or "+ N"
  const addMatch = trimmed.match(/^(?:value\s*)?\+\s*(-?\d+(?:\.\d+)?)$/)
  if (addMatch) {
    return value + parseFloat(addMatch[1])
  }
  
  // Simple subtract: "value - N" or "- N"
  const subtractMatch = trimmed.match(/^(?:value\s*)?-\s*(-?\d+(?:\.\d+)?)$/)
  if (subtractMatch) {
    return value - parseFloat(subtractMatch[1])
  }
  
  // Return value unchanged if no recognized pattern
  return value
}
