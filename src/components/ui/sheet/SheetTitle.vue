<template>
  <DialogTitle :class="cn('tw-text-lg tw-font-semibold tw-text-foreground', $attrs.class as string)">
    <slot />
  </DialogTitle>
</template>

<script setup lang="ts">
import { DialogTitle } from 'radix-vue'
import { cn } from '@/lib/utils'
</script>
