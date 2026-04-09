<template>
  <div :class="cn('tw-flex tw-flex-col tw-space-y-1.5 tw-text-center sm:tw-text-left', $attrs.class as string)">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
</script>
