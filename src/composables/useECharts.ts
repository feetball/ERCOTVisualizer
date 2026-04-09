import { ref, onMounted, onUnmounted, watch, type Ref, shallowRef, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, GaugeChart, HeatmapChart, MapChart, EffectScatterChart, LinesChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  VisualMapComponent,
  CalendarComponent,
  GeoComponent,
} from 'echarts/components'
import type { EChartsOption } from 'echarts'

// Register ECharts modules once
echarts.use([
  CanvasRenderer,
  LineChart,
  GaugeChart,
  HeatmapChart,
  MapChart,
  EffectScatterChart,
  LinesChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  VisualMapComponent,
  CalendarComponent,
  GeoComponent,
])

export type { EChartsOption }

/**
 * Reactive ECharts composable.
 * Handles init, resize, dispose, and option updates.
 */
export function useECharts(
  chartRef: Ref<HTMLElement | null>,
  initialOption?: EChartsOption
) {
  const instance = shallowRef<echarts.ECharts | null>(null)
  const option = ref<EChartsOption>(initialOption || {})
  let resizeObserver: ResizeObserver | null = null

  function init() {
    if (!chartRef.value) return
    // Dispose existing instance if any
    if (instance.value) {
      instance.value.dispose()
    }
    instance.value = echarts.init(chartRef.value, undefined, {
      renderer: 'canvas',
    })
    if (option.value) {
      instance.value.setOption(option.value)
    }
  }

  function setOption(opt: EChartsOption, notMerge = false) {
    option.value = opt
    if (instance.value) {
      instance.value.setOption(opt, { notMerge })
    }
  }

  function resize() {
    instance.value?.resize({ animation: { duration: 200 } })
  }

  onMounted(() => {
    nextTick(() => {
      init()

      // Auto-resize
      if (chartRef.value) {
        resizeObserver = new ResizeObserver(() => {
          resize()
        })
        resizeObserver.observe(chartRef.value)
      }
    })
  })

  onUnmounted(() => {
    resizeObserver?.disconnect()
    instance.value?.dispose()
    instance.value = null
  })

  // Re-apply option when it changes
  watch(option, (newOpt) => {
    if (instance.value && newOpt) {
      instance.value.setOption(newOpt, { notMerge: false })
    }
  }, { deep: true })

  return {
    instance,
    option,
    setOption,
    resize,
  }
}
