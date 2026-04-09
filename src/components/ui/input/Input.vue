<template>
  <input
    :class="cn(
      'tw-flex tw-h-9 tw-w-full tw-rounded-md tw-border tw-border-input tw-bg-transparent tw-px-3 tw-py-1 tw-text-sm tw-text-foreground tw-shadow-sm tw-transition-colors placeholder:tw-text-muted-foreground focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring disabled:tw-cursor-not-allowed disabled:tw-opacity-50',
      $attrs.class as string
    )"
    v-bind="{ ...$attrs, class: undefined }"
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  modelValue?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

defineOptions({ inheritAttrs: false })
</script>
