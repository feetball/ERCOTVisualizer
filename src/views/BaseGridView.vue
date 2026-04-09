<template>
  <div class="grid-view-container">
    <!-- Compact Top Bar -->
    <div class="toolbar">
      <span class="toolbar-title">{{ title }}</span>
      <div class="tw-flex tw-items-center tw-gap-1">
        <TimeSelector @update:time="handleTimeUpdate" class="tw-hidden sm:tw-flex" />

        <button v-if="canEdit" class="toolbar-btn" :class="{ active: editMode }" @click="toggleEditMode">
          <component :is="editMode ? Check : Pencil" :size="14" />
          <span class="tw-hidden sm:tw-inline">{{ editMode ? 'Done' : 'Edit' }}</span>
        </button>
        <span v-else class="tw-text-xs tw-text-secondary tw-border tw-border-secondary/30 tw-rounded tw-px-2 tw-py-1 tw-flex tw-items-center tw-gap-1">
          <Lock :size="12" />
          <span class="tw-hidden sm:tw-inline">View Only</span>
        </span>

        <template v-if="editMode && canEdit">
          <div class="tw-relative" ref="addMenuRef">
            <button class="toolbar-btn" @click="addMenuOpen = !addMenuOpen">
              <Plus :size="14" />
              <span class="tw-hidden md:tw-inline">Add Widget</span>
            </button>
            <div v-if="addMenuOpen" class="add-menu glass-card-solid">
              <button v-for="wt in addableWidgets" :key="wt.type" class="add-menu-item" @click="addWidget(wt.type); addMenuOpen = false">
                <component :is="wt.icon" :size="14" class="tw-text-muted-foreground" />
                {{ wt.label }}
              </button>
            </div>
          </div>
          <button class="toolbar-btn" @click="resetLayout">
            <RotateCcw :size="14" />
            <span class="tw-hidden md:tw-inline">Reset</span>
          </button>
        </template>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="grid-content">
      <Suspense>
        <template #default>
          <GridLayout
            v-model:layout="activeLayout"
            :col-num="responsiveColNum"
            :row-height="responsiveRowHeight"
            :is-draggable="editMode && !isXs"
            :is-resizable="editMode && !isXs"
            :vertical-compact="true"
            :use-css-transforms="true"
            :margin="responsiveMargin"
            @layout-updated="saveLayout"
          >
            <GridItem
              v-for="item in activeLayout"
              :key="item.i"
              :x="item.x" :y="item.y" :w="item.w" :h="item.h" :i="item.i"
              :min-w="isXs ? 1 : 2" :min-h="2"
              :class="{ 'edit-mode': editMode }"
            >
              <div class="widget-card" :style="getCardStyle(item)">
                <div class="widget-title" :style="getTitleStyle(item)" :class="{ 'widget-title-edit': editMode }">
                  <span class="tw-flex-1 tw-truncate">{{ item.title }}</span>
                  <template v-if="editMode">
                    <button class="tw-p-1 tw-rounded hover:tw-bg-accent/50 tw-text-muted-foreground hover:tw-text-foreground tw-transition-colors" @click="editWidget(item)">
                      <Pencil :size="12" />
                    </button>
                    <button class="tw-p-1 tw-rounded hover:tw-bg-destructive/20 tw-text-muted-foreground hover:tw-text-destructive tw-transition-colors" @click="removeWidget(item.i)">
                      <X :size="12" />
                    </button>
                  </template>
                </div>
                <div class="widget-content">
                  <Suspense>
                    <component :is="getWidgetComponent(item.type)" :config="item.config" :style-config="item.style" />
                    <template #fallback>
                      <div class="tw-flex tw-items-center tw-justify-center tw-h-full tw-text-muted-foreground">
                        <Loader2 :size="20" class="tw-animate-spin" />
                      </div>
                    </template>
                  </Suspense>
                </div>
              </div>
            </GridItem>
          </GridLayout>
        </template>
        <template #fallback>
          <div class="tw-flex tw-items-center tw-justify-center tw-h-full">
            <Loader2 :size="24" class="tw-animate-spin tw-text-primary" />
          </div>
        </template>
      </Suspense>
    </div>

    <!-- Status Bar -->
    <div class="status-bar">
      <div class="tw-flex tw-items-center tw-gap-1">
        <span class="status-dot" :class="apiStatus.connected ? 'connected' : 'disconnected'" />
        <span>{{ apiStatus.connected ? 'Connected' : 'Disconnected' }}</span>
      </div>
      <span class="tw-hidden sm:tw-block">Last refresh: {{ lastRefreshFormatted }}</span>
      <div class="tw-flex tw-items-center tw-gap-2">
        <span class="tw-hidden md:tw-block">Auto-refresh: {{ refreshInterval }}s</span>
        <button class="tw-p-0.5 tw-rounded hover:tw-bg-accent/50 tw-transition-colors" @click="refreshAllWidgets">
          <RefreshCw :size="12" :class="{ 'tw-animate-spin': isRefreshing }" />
        </button>
        <span class="tw-font-mono tw-opacity-60">v{{ version }}</span>
      </div>
    </div>

    <WidgetConfigDialog
      v-model="showConfigDialog"
      :edit-widget="editingWidget"
      @save="handleWidgetSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { useBreakpoints, useWindowSize } from '@vueuse/core'
import { GridLayout, GridItem } from 'grid-layout-plus'
import { useGridLayout, type LayoutItem } from '@/composables/useGridLayout'
import TimeSelector from '@/components/common/TimeSelector.vue'
import WidgetConfigDialog from '@/components/designer/WidgetConfigDialog.vue'
import packageInfo from '../../package.json'
import {
  Pencil, Check, Lock, Plus, RotateCcw, X, Loader2, RefreshCw,
  LineChart, BarChart3, Gauge, Layers, Bell, Map, TrendingUp, CalendarDays, LayoutGrid,
} from 'lucide-vue-next'
import type { WidgetType } from '@/types/widget'

const TOOLBAR_HEIGHT = 45
const STATUS_BAR_HEIGHT = 24
const version = (packageInfo as { version: string }).version

const props = withDefaults(defineProps<{
  title: string
  storageKey: string
  defaultLayout: LayoutItem[]
  allowEdit?: boolean
}>(), { allowEdit: true })

// Async widget loading
const ChartWidget = defineAsyncComponent(() => import('@/components/dashboard/ChartWidget.vue'))
const StatWidget = defineAsyncComponent(() => import('@/components/dashboard/StatWidget.vue'))
const GaugeWidget = defineAsyncComponent(() => import('@/components/dashboard/GaugeWidget.vue'))
const StackedChartWidget = defineAsyncComponent(() => import('@/components/dashboard/StackedChartWidget.vue'))
const AncillaryServicesWidget = defineAsyncComponent(() => import('@/components/dashboard/AncillaryServicesWidget.vue'))
const AlertWidget = defineAsyncComponent(() => import('@/components/dashboard/AlertWidget.vue'))
const MapWidget = defineAsyncComponent(() => import('@/components/dashboard/MapWidget.vue'))
const TrendWidget = defineAsyncComponent(() => import('@/components/dashboard/TrendWidget.vue'))
const HeatCalendarWidget = defineAsyncComponent(() => import('@/components/dashboard/HeatCalendarWidget.vue'))
const MiniDashWidget = defineAsyncComponent(() => import('@/components/dashboard/MiniDashWidget.vue'))

// Responsive breakpoints (replaces Vuetify's useDisplay)
const breakpoints = useBreakpoints({ xs: 0, sm: 600, md: 960, lg: 1264, xl: 1920 })
const isXs = breakpoints.smaller('sm')
const isSm = breakpoints.between('sm', 'md')
const isMd = breakpoints.between('md', 'lg')
const isLg = breakpoints.between('lg', 'xl')
const { height: windowHeight } = useWindowSize()

const canEdit = computed(() => props.allowEdit !== false)

const {
  layout, editMode, showConfigDialog, editingWidget, apiStatus, isRefreshing,
  refreshInterval, lastRefreshFormatted, toggleEditMode, saveLayout, loadLayout,
  resetLayout, addWidget, editWidget, removeWidget, handleWidgetSave,
  refreshAllWidgets, startAutoRefresh, stopAutoRefresh, getCardStyle, getTitleStyle
} = useGridLayout(props.storageKey, props.defaultLayout, { persist: canEdit.value })

const responsiveColNum = computed(() => {
  if (isXs.value) return 1
  if (isSm.value) return 2
  if (isMd.value) return 6
  return 12
})

const responsiveRowHeight = computed(() => {
  if (isXs.value) return 55
  if (isSm.value) return 45
  if (isMd.value) return 40
  if (isLg.value) return 45
  if (windowHeight.value > 1500) return 60
  if (windowHeight.value > 1200) return 55
  return 50
})

const responsiveMargin = computed((): [number, number] => {
  if (isXs.value) return [6, 8]
  if (isSm.value) return [8, 10]
  if (isMd.value) return [10, 10]
  return [12, 12]
})

const mobileLayout = computed(() => {
  let yPosition = 0
  return layout.value.map(item => {
    const h = item.type === 'chart' || item.type === 'stacked' || item.type === 'map' ? 5 : item.type === 'heatcalendar' ? 4 : 3
    const mobileItem = { ...item, x: 0, w: 1, h, y: yPosition }
    yPosition += h
    return mobileItem
  })
})

const activeLayout = computed({
  get: () => isXs.value ? mobileLayout.value : layout.value,
  set: (val) => { if (!isXs.value) layout.value = val }
})

const addableWidgets: { type: WidgetType; label: string; icon: typeof LineChart }[] = [
  { type: 'chart', label: 'Chart', icon: LineChart },
  { type: 'stat', label: 'Stat', icon: BarChart3 },
  { type: 'gauge', label: 'Gauge', icon: Gauge },
  { type: 'stacked', label: 'Stacked Chart', icon: Layers },
  { type: 'ancillary', label: 'Ancillary Services', icon: BarChart3 },
  { type: 'alert', label: 'Alert', icon: Bell },
  { type: 'map', label: 'ERCOT Map', icon: Map },
  { type: 'trend', label: 'Trend', icon: TrendingUp },
  { type: 'heatcalendar', label: 'Heat Calendar', icon: CalendarDays },
  { type: 'minidash', label: 'Mini Dashboard', icon: LayoutGrid },
]

function getWidgetComponent(type: string) {
  switch (type) {
    case 'chart': return ChartWidget
    case 'stacked': return StackedChartWidget
    case 'stat': return StatWidget
    case 'gauge': return GaugeWidget
    case 'ancillary': return AncillaryServicesWidget
    case 'alert': return AlertWidget
    case 'map': return MapWidget
    case 'trend': return TrendWidget
    case 'heatcalendar': return HeatCalendarWidget
    case 'minidash': return MiniDashWidget
    default: return ChartWidget
  }
}

// Add menu
const addMenuOpen = ref(false)
const addMenuRef = ref<HTMLElement | null>(null)

function handleClickOutside(e: MouseEvent) {
  if (addMenuRef.value && !addMenuRef.value.contains(e.target as Node)) addMenuOpen.value = false
}

function handleTimeUpdate() { refreshAllWidgets() }

onMounted(() => {
  loadLayout()
  startAutoRefresh()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  stopAutoRefresh()
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.grid-view-container {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: hsl(var(--background));
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: v-bind('TOOLBAR_HEIGHT + "px"');
  padding: 0 12px;
  background: linear-gradient(90deg, hsla(var(--primary), 0.06) 0%, transparent 50%, hsla(var(--secondary), 0.06) 100%);
  border-bottom: 1px solid hsla(var(--border), 0.5);
  flex-shrink: 0;
}

.toolbar-title {
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: hsl(var(--foreground));
  background: transparent;
  border: 1px solid hsla(var(--border), 0.5);
  cursor: pointer;
  transition: all 0.15s;
}

.toolbar-btn:hover { background: hsla(var(--accent), 0.5); }
.toolbar-btn.active { background: hsla(var(--primary), 0.15); border-color: hsl(var(--primary)); color: hsl(var(--primary)); }

.add-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  z-index: 50;
  padding: 4px;
  min-width: 180px;
}

.add-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  text-align: left;
  color: hsl(var(--foreground));
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.1s;
}
.add-menu-item:hover { background: hsla(var(--accent), 0.5); }

.grid-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--grid-padding, 8px);
  min-height: 0;
}

@media (min-width: 600px) { .grid-content { --grid-padding: 12px; } }
@media (min-width: 960px) { .grid-content { --grid-padding: 16px; } }
@media (min-width: 1920px) { .grid-content { --grid-padding: 24px; } }

/* Widget card — frosted glass */
.widget-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-xl, 14px);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: linear-gradient(145deg, hsla(var(--card), 0.9) 0%, hsla(var(--card), 0.7) 100%);
  border: 1px solid hsla(var(--border), 0.4);
  box-shadow: 0 4px 20px rgba(0,0,0,0.2), 0 0 40px hsla(var(--primary), 0.03), inset 0 1px 0 rgba(255,255,255,0.04);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.widget-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, hsla(var(--primary), 0.4), hsla(var(--secondary), 0.4), transparent);
}

.widget-card:hover {
  border-color: hsla(var(--primary), 0.3);
  box-shadow: 0 8px 32px rgba(0,0,0,0.25), 0 0 60px hsla(var(--primary), 0.06), inset 0 1px 0 rgba(255,255,255,0.08);
  transform: translateY(-1px);
}

.edit-mode .widget-card {
  box-shadow: 0 0 0 2px hsla(var(--primary), 0.5), 0 4px 20px rgba(0,0,0,0.25);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 2px hsla(var(--primary), 0.5), 0 4px 20px rgba(0,0,0,0.25); }
  50% { box-shadow: 0 0 0 2px hsla(var(--primary), 0.8), 0 4px 20px rgba(0,0,0,0.25), 0 0 30px hsla(var(--primary), 0.2); }
}

.widget-title {
  display: flex;
  align-items: center;
  font-size: var(--widget-title-size, 0.75rem);
  padding: var(--widget-title-padding, 6px 10px);
  min-height: var(--widget-title-height, 32px);
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  color: hsl(var(--foreground));
  position: relative;
  z-index: 0;
}

.widget-title-edit { background: hsla(var(--primary), 0.08); }

.widget-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
  z-index: 2;
  padding: 0 4px 4px;
}

/* Status bar */
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: v-bind('STATUS_BAR_HEIGHT + "px"');
  padding: 0 8px;
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--card));
  border-top: 1px solid hsla(var(--border), 0.5);
  flex-shrink: 0;
}

.status-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.status-dot.connected { background: #22c55e; box-shadow: 0 0 6px #22c55e; animation: connected-pulse 2s ease-in-out infinite; }
.status-dot.disconnected { background: #ef4444; }

@keyframes connected-pulse {
  0%, 100% { opacity: 1; } 50% { opacity: 0.6; }
}

@media (max-width: 599px) {
  .widget-title { --widget-title-size: 0.85rem; --widget-title-padding: 10px 12px; --widget-title-height: 40px; }
}
@media (min-width: 1920px) {
  .widget-title { --widget-title-size: 1rem; --widget-title-padding: 8px 12px; --widget-title-height: 36px; }
}

.edit-mode :deep(.vgl-item__resizer) { opacity: 1; background: hsla(var(--primary), 0.6); }
:deep(.vgl-item__resizer) { opacity: 0; }
</style>
