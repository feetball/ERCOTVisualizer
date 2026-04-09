<template>
  <div class="time-selector" ref="containerRef">
    <button class="time-trigger" @click="open = !open">
      <Clock :size="14" />
      <span>{{ timeRangeLabel }}</span>
    </button>
    <div v-if="open" class="time-dropdown glass-card-solid">
      <button
        v-for="range in ranges"
        :key="range.value"
        class="time-option"
        :class="{ active: selectedRange === range.value }"
        @click="selectRange(range.value)"
      >
        {{ range.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Clock } from 'lucide-vue-next'

const open = ref(false)
const selectedRange = ref('1h')
const containerRef = ref<HTMLElement | null>(null)

const ranges = [
  { label: 'Last 1 Hour', value: '1h' },
  { label: 'Last 8 Hours', value: '8h' },
  { label: 'Last 24 Hours', value: '24h' },
  { label: 'Last 7 Days', value: '7d' },
]

const timeRangeLabel = computed(() => ranges.find(r => r.value === selectedRange.value)?.label || 'Time Range')

const emit = defineEmits(['update:time'])

function selectRange(value: string) {
  selectedRange.value = value
  open.value = false
  emit('update:time', { range: value })
}

function handleClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.time-selector { position: relative; }
.time-trigger {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500;
  color: hsl(var(--foreground)); background: transparent;
  border: 1px solid hsla(var(--border), 0.5); cursor: pointer; transition: all 0.15s;
}
.time-trigger:hover { background: hsla(var(--accent), 0.5); border-color: hsl(var(--border)); }
.time-dropdown {
  position: absolute; top: 100%; right: 0; margin-top: 4px; z-index: 50;
  padding: 4px; min-width: 160px;
}
.time-option {
  display: block; width: 100%; text-align: left;
  padding: 6px 10px; border-radius: 4px; font-size: 12px;
  color: hsl(var(--foreground)); background: transparent; border: none; cursor: pointer; transition: background 0.1s;
}
.time-option:hover { background: hsla(var(--accent), 0.5); }
.time-option.active { background: hsla(var(--primary), 0.15); color: hsl(var(--primary)); font-weight: 600; }
</style>
