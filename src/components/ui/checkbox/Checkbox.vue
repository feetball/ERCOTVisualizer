<template>
  <label :class="cn('tw-flex tw-items-center tw-gap-2 tw-cursor-pointer tw-select-none', $attrs.class as string)">
    <button
      type="button"
      role="checkbox"
      :aria-checked="modelValue"
      :class="cn(
        'tw-peer tw-h-4 tw-w-4 tw-shrink-0 tw-rounded tw-border tw-border-input tw-shadow-sm tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring',
        modelValue && 'tw-bg-primary tw-border-primary tw-text-primary-foreground'
      )"
      @click="$emit('update:modelValue', !modelValue)"
    >
      <svg
        v-if="modelValue"
        class="tw-h-3 tw-w-3 tw-mx-auto"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="2 6 5 9 10 3" />
      </svg>
    </button>
    <span class="tw-text-sm tw-text-foreground"><slot /></span>
  </label>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  modelValue?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

defineOptions({ inheritAttrs: false })
</script>
