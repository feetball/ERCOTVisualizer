<template>
  <v-container fluid class="pa-0 d-flex flex-column grid-view-container">
    <!-- Compact Top Bar -->
    <v-toolbar 
      density="compact" 
      color="surface" 
      class="border-b flex-grow-0 toolbar-compact"
      :height="TOOLBAR_HEIGHT"
    >
      <v-toolbar-title class="text-body-1 font-weight-medium">{{ title }}</v-toolbar-title>
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
      
      <!-- Edit mode controls -->
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
            <v-list-item @click="addWidget('stat')" prepend-icon="mdi-poll">
              <v-list-item-title>Stat</v-list-item-title>
            </v-list-item>
            <v-list-item @click="addWidget('gauge')" prepend-icon="mdi-gauge">
              <v-list-item-title>Gauge</v-list-item-title>
            </v-list-item>
            <v-list-item @click="addWidget('stacked')" prepend-icon="mdi-chart-areaspline">
              <v-list-item-title>Stacked Chart</v-list-item-title>
            </v-list-item>
            <v-list-item @click="addWidget('ancillary')" prepend-icon="mdi-table-row">
              <v-list-item-title>Ancillary Services</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        
        <v-btn variant="text" size="small" prepend-icon="mdi-refresh" @click="resetLayout">
          <span class="d-none d-md-inline">Reset</span>
        </v-btn>
      </template>
    </v-toolbar>

    <!-- Main Content Area -->
    <div class="flex-grow-1 overflow-y-auto responsive-padding" style="min-height: 0;">
      <Suspense>
        <template #default>
          <GridLayout
            v-model:layout="activeLayout"
            :col-num="responsiveColNum"
            :row-height="responsiveRowHeight"
            :is-draggable="editMode && !xs"
            :is-resizable="editMode && !xs"
            :vertical-compact="true"
            :use-css-transforms="true"
            :margin="responsiveMargin"
            @layout-updated="saveLayout"
          >
            <GridItem
              v-for="item in activeLayout"
              :key="item.i"
              :x="item.x"
              :y="item.y"
              :w="item.w"
              :h="item.h"
              :i="item.i"
              :min-w="xs ? 1 : 2"
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
                  <template v-if="editMode">
                    <v-btn icon="mdi-pencil" size="x-small" variant="text" @click="editWidget(item)"></v-btn>
                    <v-btn icon="mdi-close" size="x-small" variant="text" color="error" @click="removeWidget(item.i)"></v-btn>
                  </template>
                </v-card-title>
                <v-card-text class="flex-grow-1 pa-1 widget-content">
                  <Suspense>
                    <component :is="getWidgetComponent(item.type)" :config="item.config" :style-config="item.style" />
                    <template #fallback>
                      <div class="d-flex align-center justify-center fill-height">
                        <v-progress-circular indeterminate size="24"></v-progress-circular>
                      </div>
                    </template>
                  </Suspense>
                </v-card-text>
              </v-card>
            </GridItem>
          </GridLayout>
        </template>
        <template #fallback>
          <div class="d-flex align-center justify-center fill-height">
            <v-progress-circular indeterminate></v-progress-circular>
          </div>
        </template>
      </Suspense>
    </div>

    <!-- Status Bar -->
    <v-footer 
      app 
      class="status-bar pa-0 px-2 d-flex align-center justify-space-between"
      :height="STATUS_BAR_HEIGHT"
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
        <span class="text-caption text-medium-emphasis ml-3 version-text">v{{ version }}</span>
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
import { computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { useDisplay } from 'vuetify'
import { GridLayout, GridItem } from 'grid-layout-plus'
import { useGridLayout, type LayoutItem } from '@/composables/useGridLayout'
import TimeSelector from '@/components/common/TimeSelector.vue'
import WidgetConfigDialog from '@/components/designer/WidgetConfigDialog.vue'
import packageInfo from '../../package.json'

// Constants
const TOOLBAR_HEIGHT = 45
const STATUS_BAR_HEIGHT = 24
const version = (packageInfo as { version: string }).version

const props = defineProps<{
  title: string
  storageKey: string
  defaultLayout: LayoutItem[]
}>()

// Async component loading with error handling
const ChartWidget = defineAsyncComponent({
  loader: () => import('@/components/dashboard/ChartWidget.vue'),
  onError: (error) => console.error('Failed to load ChartWidget:', error)
})
const StatWidget = defineAsyncComponent({
  loader: () => import('@/components/dashboard/StatWidget.vue'),
  onError: (error) => console.error('Failed to load StatWidget:', error)
})
const GaugeWidget = defineAsyncComponent({
  loader: () => import('@/components/dashboard/GaugeWidget.vue'),
  onError: (error) => console.error('Failed to load GaugeWidget:', error)
})
const StackedChartWidget = defineAsyncComponent({
  loader: () => import('@/components/dashboard/StackedChartWidget.vue'),
  onError: (error) => console.error('Failed to load StackedChartWidget:', error)
})
const AncillaryServicesWidget = defineAsyncComponent({
  loader: () => import('@/components/dashboard/AncillaryServicesWidget.vue'),
  onError: (error) => console.error('Failed to load AncillaryServicesWidget:', error)
})

// Responsive breakpoints
const { xs, sm, md, lg, height } = useDisplay()

// Use grid layout composable
const {
  layout,
  editMode,
  showConfigDialog,
  editingWidget,
  apiStatus,
  isRefreshing,
  refreshInterval,
  lastRefreshFormatted,
  toggleEditMode,
  saveLayout,
  loadLayout,
  resetLayout,
  addWidget,
  editWidget,
  removeWidget,
  handleWidgetSave,
  refreshAllWidgets,
  startAutoRefresh,
  stopAutoRefresh,
  getCardStyle,
  getTitleStyle
} = useGridLayout(props.storageKey, props.defaultLayout)

// Responsive computed properties - optimized for mobile to show all widgets at full width
const responsiveColNum = computed(() => {
  if (xs.value) return 1   // Mobile: 1 column = full width widgets
  if (sm.value) return 2   // Small tablet: 2 columns
  if (md.value) return 6   // Tablet: 6 columns
  return 12                 // Large screens: 12 columns
})

const responsiveRowHeight = computed(() => {
  if (xs.value) return 55  // Taller rows on mobile for better touch targets
  if (sm.value) return 45
  if (md.value) return 40
  if (lg.value) return 45
  if (height.value > 1500) return 60
  if (height.value > 1200) return 55
  return 50
})

const responsiveMargin = computed((): [number, number] => {
  if (xs.value) return [6, 8]   // More vertical margin on mobile
  if (sm.value) return [8, 10]
  if (md.value) return [10, 10]
  return [12, 12]
})

// Transform layout items for mobile - force full width
const mobileLayout = computed(() => {
  // On mobile, stack all widgets vertically at full width
  let yPosition = 0
  return layout.value.map((item) => {
    const mobileItem = {
      ...item,
      x: 0,
      w: 1, // Full width (1 of 1 column)
      h: item.type === 'chart' || item.type === 'stacked' ? 5 : 3, // Charts get more height
      y: yPosition
    }
    yPosition += mobileItem.h
    return mobileItem
  })
})

// Active layout based on screen size
const activeLayout = computed({
  get: () => xs.value ? mobileLayout.value : layout.value,
  set: (val) => {
    if (!xs.value) {
      layout.value = val
    }
  }
})

function getWidgetComponent(type: string) {
  switch (type) {
    case 'chart': return ChartWidget
    case 'stacked': return StackedChartWidget
    case 'stat': return StatWidget
    case 'gauge': return GaugeWidget
    case 'ancillary': return AncillaryServicesWidget
    default: return ChartWidget
  }
}

function handleTimeUpdate(_time: unknown) {
  refreshAllWidgets()
}

onMounted(() => {
  loadLayout()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.grid-view-container {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(var(--v-theme-background), 1) 0%, rgba(var(--v-theme-surface), 0.95) 100%);
}

.toolbar-compact {
  flex-shrink: 0;
  background: linear-gradient(90deg, rgba(var(--v-theme-primary), 0.1) 0%, transparent 50%, rgba(var(--v-theme-secondary), 0.1) 100%) !important;
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.3) !important;
}

.responsive-padding {
  padding: var(--grid-padding, 8px);
}

@media (min-width: 600px) {
  .responsive-padding {
    --grid-padding: 12px;
  }
}

@media (min-width: 960px) {
  .responsive-padding {
    --grid-padding: 16px;
  }
}

@media (min-width: 1920px) {
  .responsive-padding {
    --grid-padding: 24px;
  }
}

/* Widget card with glass morphism effect */
.widget-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(145deg, 
    rgba(var(--v-theme-surface), 0.9) 0%, 
    rgba(var(--v-theme-surface-bright), 0.7) 100%) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--v-theme-primary), 0.15) !important;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.25),
    0 0 40px rgba(var(--v-theme-primary), 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
  overflow: hidden;
}

.widget-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(var(--v-theme-primary), 0.5), 
    rgba(var(--v-theme-secondary), 0.5), 
    transparent);
}

.widget-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.4) !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 60px rgba(var(--v-theme-primary), 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
  transform: translateY(-2px);
}

.edit-mode .widget-card {
  box-shadow: 
    0 0 0 2px rgba(var(--v-theme-primary), 0.5),
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(var(--v-theme-primary), 0.2) !important;
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 
      0 0 0 2px rgba(var(--v-theme-primary), 0.5),
      0 4px 20px rgba(0, 0, 0, 0.3),
      0 0 30px rgba(var(--v-theme-primary), 0.2);
  }
  50% {
    box-shadow: 
      0 0 0 2px rgba(var(--v-theme-primary), 0.8),
      0 4px 20px rgba(0, 0, 0, 0.3),
      0 0 50px rgba(var(--v-theme-primary), 0.4);
  }
}

.widget-title {
  font-size: var(--widget-title-size, 0.75rem);
  padding: var(--widget-title-padding, 6px 10px);
  min-height: var(--widget-title-height, 32px);
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  background: linear-gradient(90deg, 
    rgba(var(--v-theme-primary), 0.08) 0%, 
    transparent 100%);
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.1);
}

/* Mobile-specific title styling */
@media (max-width: 599px) {
  .widget-title {
    --widget-title-size: 0.85rem;
    --widget-title-padding: 10px 12px;
    --widget-title-height: 40px;
  }
}

@media (min-width: 1920px) {
  .widget-title {
    --widget-title-size: 1rem;
    --widget-title-padding: 8px 12px;
    --widget-title-height: 36px;
  }
}

@media (min-width: 2560px) {
  .widget-title {
    --widget-title-size: 1.25rem;
    --widget-title-padding: 10px 16px;
    --widget-title-height: 44px;
  }
}

.widget-title-edit {
  background: linear-gradient(90deg, 
    rgba(var(--v-theme-primary), 0.15) 0%, 
    rgba(var(--v-theme-secondary), 0.08) 100%);
}

.widget-content {
  min-height: 0;
  overflow: hidden;
  position: relative;
}

/* Status bar with glow effect */
.status-bar {
  border-top: 1px solid rgba(var(--v-theme-primary), 0.2);
  font-size: var(--status-bar-font-size, 11px);
  background: linear-gradient(180deg, 
    rgba(var(--v-theme-surface), 0.95) 0%, 
    rgba(var(--v-theme-background), 1) 100%) !important;
  backdrop-filter: blur(8px);
}

@media (min-width: 1920px) {
  .status-bar {
    --status-bar-font-size: 13px;
  }
}

.edit-mode :deep(.vgl-item__resizer) {
  opacity: 1;
  background: rgba(var(--v-theme-primary), 0.6);
}

:deep(.vgl-item__resizer) {
  opacity: 0;
}

/* Connected indicator pulse animation */
.status-bar :deep(.v-icon--success) {
  animation: connected-pulse 2s ease-in-out infinite;
}

@keyframes connected-pulse {
  0%, 100% {
    opacity: 1;
    filter: drop-shadow(0 0 2px currentColor);
  }
  50% {
    opacity: 0.7;
    filter: drop-shadow(0 0 6px currentColor);
  }
}

.version-text {
  font-family: monospace;
  opacity: 0.6;
}
</style>
