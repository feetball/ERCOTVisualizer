<template>
  <div :class="cn('tw-flex tw-flex-col tw-space-y-2 tw-text-left', $attrs.class as string)">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
</script>
