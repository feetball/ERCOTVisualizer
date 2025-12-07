<template>
  <v-container fluid class="pa-0 d-flex flex-column system-summary-container">
    <!-- Compact Top Bar (25% smaller) -->
    <v-toolbar 
      density="compact" 
      color="surface" 
      class="border-b flex-grow-0 toolbar-compact"
      :height="36"
    >
      <v-toolbar-title class="text-body-2 font-weight-medium">System Summary</v-toolbar-title>
      <v-spacer></v-spacer>
      
      <!-- Time selector - hidden on small screens -->
      <TimeSelector @update:time="handleTimeUpdate" class="mr-2 d-none d-sm-flex" />
      
      <!-- Edit mode toggle -->
      <v-btn 
        :variant="editMode ? 'flat' : 'text'" 
        :color="editMode ? 'primary' : undefined"
        size="small"
        :prepend-icon="editMode ? 'mdi-check' : 'mdi-pencil'"
        @click="toggleEditMode"
        class="mr-1"
      >
        <span class="d-none d-sm-inline">{{ editMode ? 'Done' : 'Edit' }}</span>
      </v-btn>
      
      <!-- Edit mode controls - only shown in edit mode -->
      <template v-if="editMode">
        <v-menu>
          <template #activator="{ props }">
            <v-btn v-bind="props" variant="text" size="small" prepend-icon="mdi-plus">
              <span class="d-none d-md-inline">Add Widget</span>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item @click="addWidget('chart')" prepend-icon="mdi-chart-line">
              <v-list-item-title>Chart</v-list-item-title>
            </v-list-item>
            <v-list-item @click="addWidget('value')" prepend-icon="mdi-numeric">
              <v-list-item-title>Single Value</v-list-item-title>
            </v-list-item>
            <v-list-item @click="addWidget('stat')" prepend-icon="mdi-poll">
              <v-list-item-title>Stat (Grafana-style)</v-list-item-title>
            </v-list-item>
            <v-list-item @click="addWidget('gauge')" prepend-icon="mdi-gauge">
              <v-list-item-title>Gauge</v-list-item-title>
            </v-list-item>
            <v-list-item @click="addWidget('table')" prepend-icon="mdi-table">
              <v-list-item-title>Data Table</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        
        <v-btn variant="text" size="small" prepend-icon="mdi-refresh" @click="resetLayout">
          <span class="d-none d-md-inline">Reset</span>
        </v-btn>
      </template>
    </v-toolbar>

    <!-- Main Content Area with responsive padding -->
    <div class="flex-grow-1 overflow-y-auto responsive-padding" style="min-height: 0;">
      <GridLayout
        v-model:layout="layout"
        :col-num="responsiveColNum"
        :row-height="responsiveRowHeight"
        :is-draggable="editMode"
        :is-resizable="editMode"
        :vertical-compact="true"
        :use-css-transforms="true"
        :margin="responsiveMargin"
        @layout-updated="saveLayout"
      >
        <GridItem
          v-for="item in layout"
          :key="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          :min-w="2"
          :min-h="2"
          :class="{ 'edit-mode': editMode }"
        >
          <v-card class="fill-height d-flex flex-column widget-card" :style="getCardStyle(item)">
            <v-card-title 
              class="widget-title d-flex align-center" 
              :style="getTitleStyle(item)"
              :class="{ 'widget-title-edit': editMode }"
            >
              <span class="flex-grow-1 text-truncate">{{ item.title }}</span>
              <!-- Edit controls - only visible in edit mode -->
              <template v-if="editMode">
                <v-btn icon="mdi-pencil" size="x-small" variant="text" @click="editWidget(item)"></v-btn>
                <v-btn icon="mdi-close" size="x-small" variant="text" color="error" @click="removeWidget(item.i)"></v-btn>
              </template>
            </v-card-title>
            <v-card-text class="flex-grow-1 pa-1 widget-content">
              <component :is="getWidgetComponent(item.type)" :config="item.config" :style="item.style" />
            </v-card-text>
          </v-card>
        </GridItem>
      </GridLayout>
    </div>

    <!-- Status Bar -->
    <v-footer 
      app 
      class="status-bar pa-0 px-2 d-flex align-center justify-space-between"
      :height="24"
      color="surface"
    >
      <div class="d-flex align-center">
        <v-icon 
          :icon="apiStatus.connected ? 'mdi-circle' : 'mdi-circle-outline'" 
          :color="apiStatus.connected ? 'success' : 'error'" 
          size="10" 
          class="mr-1"
        ></v-icon>
        <span class="text-caption">{{ apiStatus.connected ? 'Connected' : 'Disconnected' }}</span>
      </div>
      <div class="text-caption text-medium-emphasis d-none d-sm-block">
        Last refresh: {{ lastRefreshFormatted }}
      </div>
      <div class="d-flex align-center">
        <span class="text-caption text-medium-emphasis mr-2 d-none d-md-block">Auto-refresh: {{ refreshInterval }}s</span>
        <v-btn 
          icon="mdi-refresh" 
          size="x-small" 
          variant="text" 
          @click="refreshAllWidgets"
          :loading="isRefreshing"
        ></v-btn>
      </div>
    </v-footer>

    <WidgetConfigDialog
      v-model="showConfigDialog"
      :edit-widget="editingWidget"
      @save="handleWidgetSave"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { useDisplay } from 'vuetify'
import { GridLayout, GridItem } from 'grid-layout-plus'
import TimeSelector from '@/components/common/TimeSelector.vue'
import WidgetConfigDialog from '@/components/designer/WidgetConfigDialog.vue'

const ChartWidget = defineAsyncComponent(() => import('@/components/dashboard/ChartWidget.vue'))
const ValueWidget = defineAsyncComponent(() => import('@/components/dashboard/ValueWidget.vue'))
const TableWidget = defineAsyncComponent(() => import('@/components/dashboard/TableWidget.vue'))
const StatWidget = defineAsyncComponent(() => import('@/components/dashboard/StatWidget.vue'))
const GaugeWidget = defineAsyncComponent(() => import('@/components/dashboard/GaugeWidget.vue'))
const StackedChartWidget = defineAsyncComponent(() => import('@/components/dashboard/StackedChartWidget.vue'))

// Responsive breakpoints
const { xs, sm, md, lg, xlAndUp, width, height } = useDisplay()

// Edit mode state
const editMode = ref(false)

// Status bar state
const apiStatus = ref({ connected: true })
const lastRefresh = ref(new Date())
const isRefreshing = ref(false)
const refreshInterval = ref(5)
let statusCheckInterval: any = null

// Responsive computed properties
const responsiveColNum = computed(() => {
  if (xs.value) return 4   // Mobile: 4 columns
  if (sm.value) return 6   // Tablet: 6 columns
  if (md.value) return 8   // Small desktop: 8 columns
  return 12                 // Large screens: 12 columns
})

const responsiveRowHeight = computed(() => {
  // Scale row height based on screen size
  // From mobile (30px) to wallboard (60px+)
  if (xs.value) return 30
  if (sm.value) return 35
  if (md.value) return 40
  if (lg.value) return 45
  // For very large screens (wallboard), scale with height
  if (height.value > 1500) return 60
  if (height.value > 1200) return 55
  return 50
})

const responsiveMargin = computed((): [number, number] => {
  if (xs.value) return [4, 4]
  if (sm.value) return [6, 6]
  if (md.value) return [8, 8]
  return [10, 10]
})

const lastRefreshFormatted = computed(() => {
  return lastRefresh.value.toLocaleTimeString()
})

function toggleEditMode() {
  editMode.value = !editMode.value
}

function refreshAllWidgets() {
  isRefreshing.value = true
  lastRefresh.value = new Date()
  // Simulate refresh - in real app this would trigger data fetches
  setTimeout(() => {
    isRefreshing.value = false
  }, 500)
}

function checkApiStatus() {
  // Simulate API status check - in real app this would ping the API
  apiStatus.value.connected = true
  lastRefresh.value = new Date()
}

interface LayoutItem {
  i: string
  x: number
  y: number
  w: number
  h: number
  type: string
  title: string
  config: any
  style?: any
}

const STORAGE_KEY = 'system-summary-layout'

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

const layout = ref<LayoutItem[]>([...defaultLayout.map(item => ({ ...item }))])
const showConfigDialog = ref(false)
const editingWidget = ref<LayoutItem | null>(null)

function getWidgetComponent(type: string) {
  switch (type) {
    case 'chart': return ChartWidget
    case 'stacked': return StackedChartWidget
    case 'value': return ValueWidget
    case 'stat': return StatWidget
    case 'gauge': return GaugeWidget
    case 'table': return TableWidget
    default: return ChartWidget
  }
}

function getCardStyle(item: LayoutItem) {
  const s: any = {}
  if (item.style?.backgroundColor) s.backgroundColor = item.style.backgroundColor
  return s
}

function getTitleStyle(item: LayoutItem) {
  const s: any = { fontSize: item.style?.titleSize || '0.875rem' }
  if (item.style?.titleColor) s.color = item.style.titleColor
  return s
}

function saveLayout() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layout.value))
}

function loadLayout() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      layout.value = JSON.parse(saved)
    } catch {
      layout.value = [...defaultLayout.map(item => ({ ...item }))]
    }
  }
}

function resetLayout() {
  localStorage.removeItem(STORAGE_KEY)
  layout.value = [...defaultLayout.map(item => ({ ...item }))]
}

function addWidget(type: string) {
  editingWidget.value = null
  showConfigDialog.value = true
  // Pre-set the type
  editingWidget.value = { i: '', x: 0, y: 0, w: 6, h: 5, type, title: '', config: { tag: '', durationHours: 4 }, style: {} }
}

function editWidget(item: LayoutItem) {
  editingWidget.value = { ...item }
  showConfigDialog.value = true
}

function removeWidget(id: string) {
  const idx = layout.value.findIndex((w: LayoutItem) => w.i === id)
  if (idx !== -1) {
    layout.value.splice(idx, 1)
    saveLayout()
  }
}

function handleWidgetSave(data: any) {
  if (data.isEditing && editingWidget.value?.i) {
    // Update existing
    const idx = layout.value.findIndex((w: LayoutItem) => w.i === editingWidget.value!.i)
    if (idx !== -1) {
      layout.value[idx] = {
        ...layout.value[idx],
        type: data.type,
        title: data.title,
        config: { ...data.config },
        style: { ...data.style }
      }
    }
  } else {
    // Add new
    const newId = Date.now().toString()
    const defaultSizes: any = { chart: { w: 6, h: 6 }, value: { w: 3, h: 4 }, stat: { w: 3, h: 5 }, gauge: { w: 3, h: 5 }, table: { w: 6, h: 6 } }
    const size = defaultSizes[data.type] || { w: 6, h: 5 }
    layout.value.push({
      i: newId,
      x: 0,
      y: 0,
      w: size.w,
      h: size.h,
      type: data.type,
      title: data.title || 'New Widget',
      config: { ...data.config },
      style: { ...data.style }
    })
  }
  saveLayout()
}

function handleTimeUpdate(time: any) {
  console.log('Time updated:', time)
}

onMounted(() => {
  loadLayout()
  checkApiStatus()
  // Check API status periodically
  statusCheckInterval = setInterval(checkApiStatus, refreshInterval.value * 1000)
})

onUnmounted(() => {
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval)
  }
})
</script>

<style>
.vgl-layout {
  min-height: 100%;
}
</style>

<style scoped>
.system-summary-container {
  height: 100%;
  overflow: hidden;
}

.toolbar-compact {
  flex-shrink: 0;
}

/* Responsive padding */
.responsive-padding {
  padding: 8px;
}

@media (min-width: 600px) {
  .responsive-padding {
    padding: 12px;
  }
}

@media (min-width: 960px) {
  .responsive-padding {
    padding: 16px;
  }
}

@media (min-width: 1920px) {
  .responsive-padding {
    padding: 24px;
  }
}

/* Widget card styles */
.widget-card {
  transition: box-shadow 0.2s ease;
}

.edit-mode .widget-card {
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.3) !important;
}

.widget-title {
  font-size: 0.75rem;
  padding: 4px 8px;
  min-height: 28px;
  line-height: 1.2;
}

/* Larger title for big screens */
@media (min-width: 1920px) {
  .widget-title {
    font-size: 1rem;
    padding: 8px 12px;
    min-height: 36px;
  }
}

@media (min-width: 2560px) {
  .widget-title {
    font-size: 1.25rem;
    padding: 10px 16px;
    min-height: 44px;
  }
}

.widget-title-edit {
  background: rgba(var(--v-theme-primary), 0.05);
}

.widget-content {
  min-height: 0;
  overflow: hidden;
}

/* Status bar */
.status-bar {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-size: 11px;
}

@media (min-width: 1920px) {
  .status-bar {
    height: 32px !important;
    font-size: 13px;
  }
}

/* Grid item drag handle visibility in edit mode */
.edit-mode :deep(.vgl-item__resizer) {
  opacity: 1;
}

:deep(.vgl-item__resizer) {
  opacity: 0;
}
</style>
