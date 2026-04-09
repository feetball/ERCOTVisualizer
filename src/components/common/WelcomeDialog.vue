<template>
  <Dialog :open="showDialog" @update:open="showDialog = $event">
    <DialogContent class="tw-max-w-lg">
      <DialogHeader>
        <DialogTitle class="tw-flex tw-items-center tw-gap-2">
          <Zap :size="20" class="tw-text-primary" />
          Welcome to ERCOT Grid Monitor
        </DialogTitle>
        <DialogDescription>
          Monitor real-time ERCOT grid operations with customizable dashboards.
        </DialogDescription>
      </DialogHeader>

      <div class="tw-flex tw-flex-col tw-gap-3 tw-py-2">
        <FeatureItem :icon="LayoutDashboard" title="Pre-built Views" description="Grid Summary and Large Display views come ready to use" />
        <FeatureItem :icon="PencilRuler" title="Editable Layouts" description="Click &quot;Edit&quot; to drag, resize, and customize your views" />
        <FeatureItem :icon="LayoutGrid" title="Widget Library" description="Charts, stats, gauges, and more to visualize grid data" />
        <FeatureItem :icon="PlusCircle" title="Custom Views" description="Create your own dashboards from the navigation menu" />
        <FeatureItem :icon="Bell" title="Alert Indicators" description="Color-coded status for frequency, reserves, load, and price" />
      </div>

      <div class="tw-rounded-lg tw-bg-primary/10 tw-border tw-border-primary/20 tw-px-3 tw-py-2 tw-text-sm tw-text-foreground/80">
        <Info :size="14" class="tw-inline tw-mr-1 tw-text-primary" />
        Pre-defined views cannot be permanently modified. Create a custom view to build your own layout.
      </div>

      <div class="tw-flex tw-items-center tw-justify-between tw-pt-2">
        <Checkbox v-model="dontShowAgain">Don't show this again</Checkbox>
        <button
          class="tw-text-sm tw-text-primary hover:tw-underline tw-flex tw-items-center tw-gap-1"
          @click="goToHelp"
        >
          <HelpCircle :size="14" />
          More Help
        </button>
      </div>

      <DialogFooter>
        <Button size="lg" @click="dismiss">Get Started</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, type Component } from 'vue'
import { useRouter } from 'vue-router'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Zap, LayoutDashboard, PencilRuler, LayoutGrid, PlusCircle, Bell, Info, HelpCircle } from 'lucide-vue-next'

const STORAGE_KEY = 'ercot-welcome-dismissed'
const router = useRouter()
const showDialog = ref(false)
const dontShowAgain = ref(false)

onMounted(() => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    showDialog.value = true
  }
})

function dismiss() {
  if (dontShowAgain.value) {
    localStorage.setItem(STORAGE_KEY, 'true')
  }
  showDialog.value = false
}

function goToHelp() {
  dismiss()
  router.push('/help')
}

// Inline sub-component for the feature list items
const FeatureItem = {
  props: { icon: Object, title: String, description: String },
  template: `
    <div class="tw-flex tw-items-start tw-gap-3">
      <component :is="icon" :size="16" class="tw-mt-0.5 tw-shrink-0 tw-text-primary" />
      <div>
        <div class="tw-text-sm tw-font-medium tw-text-foreground">{{ title }}</div>
        <div class="tw-text-xs tw-text-muted-foreground">{{ description }}</div>
      </div>
    </div>
  `,
} as Component
</script>
