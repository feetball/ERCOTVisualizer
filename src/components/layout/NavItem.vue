<template>
  <button
    type="button"
    class="nav-item tw-group tw-flex tw-items-center tw-w-full tw-gap-3 tw-rounded-lg tw-px-3 tw-py-2 tw-text-sm tw-text-foreground/80 hover:tw-text-foreground hover:tw-bg-accent/60 tw-transition-all tw-duration-150"
    @click="$emit('click')"
  >
    <component :is="iconComponent" :size="16" class="tw-shrink-0 tw-text-muted-foreground group-hover:tw-text-primary tw-transition-colors" />
    <span class="tw-flex-1 tw-text-left tw-truncate">{{ label }}</span>
    <span class="tw-flex tw-gap-0.5 tw-opacity-0 group-hover:tw-opacity-100 tw-transition-opacity">
      <slot name="actions" />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  LineChart, Monitor, LayoutGrid, Globe, Plus, HelpCircle,
} from 'lucide-vue-next'

const props = defineProps<{
  icon: string
  label: string
}>()

defineEmits<{
  click: []
}>()

const iconMap: Record<string, typeof LineChart> = {
  'line-chart': LineChart,
  'monitor': Monitor,
  'layout-grid': LayoutGrid,
  'globe': Globe,
  'plus': Plus,
  'help-circle': HelpCircle,
}

const iconComponent = computed(() => iconMap[props.icon] || LayoutGrid)
</script>

<style scoped>
.nav-item:active {
  transform: scale(0.98);
}
</style>
