<template>
  <div
    :class="cn('skeleton-shimmer tw-rounded-md', $attrs.class as string)"
    :style="{ width, height }"
  />
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

withDefaults(defineProps<{
  width?: string
  height?: string
}>(), {
  width: '100%',
  height: '1rem',
})
</script>

<style scoped>
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    hsla(var(--muted), 0.3) 25%,
    hsla(var(--muted), 0.5) 50%,
    hsla(var(--muted), 0.3) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s linear infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
