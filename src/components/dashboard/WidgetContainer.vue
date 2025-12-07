<template>
  <v-card class="fill-height d-flex flex-column">
    <v-card-title class="d-flex justify-space-between align-center py-1 px-2" style="font-size: 1rem; height: 40px;">
      {{ widget.title }}
      <v-btn v-if="isEditing" icon="mdi-close" size="x-small" variant="text" color="error" @click="$emit('remove', widget.i)"></v-btn>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text class="flex-grow-1 pa-2" style="overflow: hidden;">
      <component :is="componentType" :config="widget.config" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'

interface Widget {
  i: string
  type: string
  title: string
  config: Record<string, unknown>
}

const props = defineProps<{
  widget: Widget
  isEditing: boolean
}>()

defineEmits(['remove'])

const ChartWidget = defineAsyncComponent(() => import('./ChartWidget.vue'))
const ValueWidget = defineAsyncComponent(() => import('./ValueWidget.vue'))

const componentType = computed(() => {
  switch (props.widget.type) {
    case 'chart': return ChartWidget
    case 'value': return ValueWidget
    default: return null
  }
})
</script>
