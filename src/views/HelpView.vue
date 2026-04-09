<template>
  <div class="help-container">
    <header class="help-header">
      <h1 class="tw-text-sm tw-font-semibold tw-text-foreground">Help & Documentation</h1>
    </header>

    <div class="help-content">
      <div class="tw-max-w-3xl tw-mx-auto tw-space-y-6 tw-p-6">

        <HelpCard title="Getting Started" :icon="Rocket">
          <p class="tw-text-sm tw-text-foreground/80 tw-mb-3">
            Welcome to ERCOT Grid Visualizer! This application provides real-time monitoring
            of the Electric Reliability Council of Texas (ERCOT) grid operations.
          </p>
          <HelpListItem :icon="LineChart" title="Grid Summary" description="View live grid metrics, generation mix, and system demand" />
          <HelpListItem :icon="Monitor" title="Large Display" description="Full-screen view optimized for large monitors" />
          <HelpListItem :icon="LayoutDashboard" title="My Views" description="Create and manage custom dashboard layouts" />
          <HelpListItem :icon="MapPin" title="ERCOT Map" description="Interactive geographic visualization of the Texas grid" />
        </HelpCard>

        <HelpCard title="Creating and Editing Views" :icon="PencilRuler">
          <h3 class="tw-text-sm tw-font-semibold tw-text-foreground tw-mb-2">1. Enter Edit Mode</h3>
          <p class="tw-text-sm tw-text-foreground/80 tw-mb-3">
            Click the <span class="tw-px-2 tw-py-0.5 tw-rounded tw-bg-primary/20 tw-text-primary tw-text-xs tw-font-medium">Edit</span>
            button in the top toolbar to enable editing.
          </p>

          <h3 class="tw-text-sm tw-font-semibold tw-text-foreground tw-mb-2">2. Available Widgets</h3>
          <div class="tw-space-y-1 tw-mb-4">
            <HelpListItem :icon="LineChart" title="Chart / Stacked Chart" description="Time series and stacked area charts" />
            <HelpListItem :icon="Activity" title="Stat / Trend / Gauge" description="Current values with sparklines, trends, and gauges" />
            <HelpListItem :icon="MapPin" title="ERCOT Map" description="Interactive geographic grid visualization" />
            <HelpListItem :icon="Grid3x3" title="Mini Dashboard" description="Compact multi-metric overview" />
            <HelpListItem :icon="CalendarDays" title="Heat Calendar" description="90-day historical heatmap" />
            <HelpListItem :icon="Bell" title="Alert Indicator" description="Color-coded status for critical metrics" />
          </div>

          <h3 class="tw-text-sm tw-font-semibold tw-text-foreground tw-mb-2">3. Save Your Layout</h3>
          <p class="tw-text-sm tw-text-foreground/80">
            Click <span class="tw-px-2 tw-py-0.5 tw-rounded tw-bg-primary/20 tw-text-primary tw-text-xs tw-font-medium">Done</span>
            when finished. Layouts are saved to your browser's local storage.
          </p>
        </HelpCard>

        <HelpCard title="Available ERCOT Data" :icon="Database">
          <div class="tw-overflow-x-auto">
            <table class="tw-w-full tw-text-sm">
              <thead>
                <tr class="tw-border-b tw-border-border/50">
                  <th class="tw-text-left tw-py-2 tw-pr-4 tw-text-xs tw-font-semibold tw-text-muted-foreground tw-uppercase">Metric</th>
                  <th class="tw-text-left tw-py-2 tw-pr-4 tw-text-xs tw-font-semibold tw-text-muted-foreground tw-uppercase">Description</th>
                  <th class="tw-text-left tw-py-2 tw-text-xs tw-font-semibold tw-text-muted-foreground tw-uppercase">Unit</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="metric in metrics" :key="metric.name" class="tw-border-b tw-border-border/20">
                  <td class="tw-py-1.5 tw-pr-4 tw-font-medium tw-text-foreground">{{ metric.name }}</td>
                  <td class="tw-py-1.5 tw-pr-4 tw-text-foreground/70">{{ metric.desc }}</td>
                  <td class="tw-py-1.5 tw-text-foreground/70">{{ metric.unit }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </HelpCard>

        <HelpCard title="Tips & Keyboard Shortcuts" :icon="Lightbulb">
          <HelpListItem :icon="Smartphone" title="Responsive" description="Adapts to mobile, tablet, desktop, and large displays" />
          <HelpListItem :icon="RefreshCw" title="Auto-Refresh" description="Data refreshes every 5-30 seconds depending on widget type" />
          <HelpListItem :icon="SunMoon" title="Theme" description="Toggle dark/light mode from the header" />
          <div class="tw-mt-3 tw-space-y-1">
            <div class="tw-flex tw-gap-4 tw-text-sm"><kbd>E</kbd> <span class="tw-text-foreground/70">Toggle edit mode</span></div>
            <div class="tw-flex tw-gap-4 tw-text-sm"><kbd>F11</kbd> <span class="tw-text-foreground/70">Fullscreen</span></div>
            <div class="tw-flex tw-gap-4 tw-text-sm"><kbd>Esc</kbd> <span class="tw-text-foreground/70">Exit edit / close dialogs</span></div>
          </div>
        </HelpCard>

        <div class="glass-card-solid tw-p-6 tw-text-center">
          <p class="tw-text-sm tw-text-foreground/80 tw-mb-3">For additional support or to report issues:</p>
          <a
            href="https://github.com/feetball/ERCOTVisualizer"
            target="_blank"
            class="tw-inline-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-md tw-border tw-border-primary tw-text-primary tw-text-sm tw-font-medium hover:tw-bg-primary/10 tw-transition-colors"
          >
            <Github :size="16" />
            GitHub Repository
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Component } from 'vue'
import {
  Rocket, LineChart, Monitor, LayoutDashboard, MapPin, PencilRuler,
  Activity, Grid3x3, CalendarDays, Bell, Database, Lightbulb,
  Smartphone, RefreshCw, SunMoon, Github,
} from 'lucide-vue-next'

const metrics = [
  { name: 'Grid Frequency', desc: 'Current grid frequency', unit: 'Hz' },
  { name: 'System Demand', desc: 'Total system load', unit: 'MW' },
  { name: 'Wind Generation', desc: 'Wind power output', unit: 'MW' },
  { name: 'Solar Generation', desc: 'Solar power output', unit: 'MW' },
  { name: 'Natural Gas', desc: 'Gas generation', unit: 'MW' },
  { name: 'Nuclear', desc: 'Nuclear generation', unit: 'MW' },
  { name: 'Coal', desc: 'Coal generation', unit: 'MW' },
  { name: 'Battery Storage', desc: 'Net storage output/input', unit: 'MW' },
  { name: 'Operating Reserves', desc: 'Available spinning reserves', unit: 'MW' },
  { name: 'Available Capacity', desc: 'Total available capacity', unit: 'MW' },
  { name: 'Real-Time Price', desc: 'Hub average price', unit: '$/MWh' },
  { name: 'Outages', desc: 'Total forced outages', unit: 'MW' },
]

// Sub-components
const HelpCard = {
  props: { title: String, icon: Object },
  template: `
    <div class="glass-card-solid tw-p-5">
      <h2 class="tw-flex tw-items-center tw-gap-2 tw-text-base tw-font-semibold tw-text-foreground tw-mb-3">
        <component :is="icon" :size="18" class="tw-text-primary" />
        {{ title }}
      </h2>
      <slot />
    </div>
  `,
} as Component

const HelpListItem = {
  props: { icon: Object, title: String, description: String },
  template: `
    <div class="tw-flex tw-items-start tw-gap-3 tw-py-1.5">
      <component :is="icon" :size="14" class="tw-mt-0.5 tw-shrink-0 tw-text-primary/70" />
      <div>
        <span class="tw-text-sm tw-font-medium tw-text-foreground">{{ title }}</span>
        <span class="tw-text-sm tw-text-foreground/60"> — {{ description }}</span>
      </div>
    </div>
  `,
} as Component
</script>

<style scoped>
.help-container { display: flex; flex-direction: column; height: 100vh; max-height: 100vh; overflow: hidden; }
.help-header {
  padding: 12px 16px; border-bottom: 1px solid hsla(var(--border), 0.5);
  background: hsl(var(--card)); flex-shrink: 0;
}
.help-content { flex: 1; overflow-y: auto; }
kbd {
  background: hsla(var(--muted), 0.5); border: 1px solid hsla(var(--border), 0.5);
  border-radius: 4px; padding: 1px 6px; font-family: var(--font-mono); font-size: 0.8em;
  color: hsl(var(--foreground));
}
</style>
