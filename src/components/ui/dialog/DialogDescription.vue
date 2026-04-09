<template>
  <DialogDescription :class="cn('tw-text-sm tw-text-muted-foreground', $attrs.class as string)">
    <slot />
  </DialogDescription>
</template>

<script setup lang="ts">
import { DialogDescription } from 'radix-vue'
import { cn } from '@/lib/utils'
</script>
