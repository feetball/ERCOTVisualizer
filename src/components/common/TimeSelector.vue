<template>
  <v-menu v-model="menu" :close-on-content-click="false" location="bottom end">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" variant="outlined" prepend-icon="mdi-clock-outline">
        {{ timeRangeLabel }}
      </v-btn>
    </template>

    <v-card min-width="300">
      <v-card-text>
        <v-select
          v-model="selectedRange"
          :items="ranges"
          label="Quick Select"
          item-title="label"
          item-value="value"
          density="compact"
        ></v-select>
        
        <div v-if="selectedRange === 'custom'">
          <v-text-field label="Start Time" v-model="customStart" density="compact"></v-text-field>
          <v-text-field label="End Time" v-model="customEnd" density="compact"></v-text-field>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="applyTime">Apply</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const menu = ref(false)
const selectedRange = ref('1h')
const customStart = ref('')
const customEnd = ref('')

const ranges = [
  { label: 'Last 1 Hour', value: '1h' },
  { label: 'Last 8 Hours', value: '8h' },
  { label: 'Last 24 Hours', value: '24h' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Custom', value: 'custom' }
]

const timeRangeLabel = computed(() => {
  const range = ranges.find(r => r.value === selectedRange.value)
  return range ? range.label : 'Time Range'
})

const emit = defineEmits(['update:time'])

function applyTime() {
  menu.value = false
  emit('update:time', { range: selectedRange.value, start: customStart.value, end: customEnd.value })
}
</script>
