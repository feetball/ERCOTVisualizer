/**
 * ECharts theme configuration matching the ERCOT energy design tokens.
 * Applied to all chart instances for consistent look.
 */

/** Common axis style for dark backgrounds */
export const AXIS_STYLE = {
  axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
  axisTick: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
  axisLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 10 },
  splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)', type: 'dashed' as const } },
}

/** Common tooltip style */
export const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(15, 20, 35, 0.95)',
  borderColor: 'rgba(255,255,255,0.1)',
  textStyle: { color: '#e2e8f0', fontSize: 12 },
  borderWidth: 1,
}

/** Common grid padding */
export const GRID_STYLE = {
  left: 60,
  right: 16,
  top: 12,
  bottom: 36,
  containLabel: false,
}

/** Animation defaults */
export const ANIMATION_DEFAULTS = {
  animation: true,
  animationDuration: 500,
  animationDurationUpdate: 400,
  animationEasing: 'cubicInOut' as const,
  animationEasingUpdate: 'cubicInOut' as const,
}

/** Standard area gradient fill helper */
export function areaGradient(color: string, opacityFrom = 0.35, opacityTo = 0.02) {
  return {
    type: 'linear' as const,
    x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [
      { offset: 0, color: withAlpha(color, opacityFrom) },
      { offset: 1, color: withAlpha(color, opacityTo) },
    ],
  }
}

/** Hex color to rgba */
function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
