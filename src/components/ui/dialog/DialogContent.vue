<template>
  <DialogPortal>
    <DialogOverlay
      class="tw-fixed tw-inset-0 tw-z-50 tw-bg-black/60 tw-backdrop-blur-sm data-[state=open]:tw-animate-in data-[state=closed]:tw-animate-out data-[state=closed]:tw-fade-out-0 data-[state=open]:tw-fade-in-0"
    />
    <RadixDialogContent
      :class="cn(
        'tw-fixed tw-left-1/2 tw-top-1/2 tw-z-50 tw-grid tw-w-full tw-max-w-lg -tw-translate-x-1/2 -tw-translate-y-1/2 tw-gap-4 tw-p-6 tw-shadow-2xl tw-duration-200 data-[state=open]:tw-animate-in data-[state=closed]:tw-animate-out data-[state=closed]:tw-fade-out-0 data-[state=open]:tw-fade-in-0 data-[state=closed]:tw-zoom-out-95 data-[state=open]:tw-zoom-in-95 data-[state=closed]:tw-slide-out-to-left-1/2 data-[state=closed]:tw-slide-out-to-top-[48%] data-[state=open]:tw-slide-in-from-left-1/2 data-[state=open]:tw-slide-in-from-top-[48%]',
        'glass-card-solid',
        $attrs.class as string
      )"
      v-bind="{ ...$attrs, class: undefined }"
      @escape-key-down="emits('escapeKeyDown', $event)"
      @pointer-down-outside="emits('pointerDownOutside', $event)"
    >
      <slot />
      <DialogClose
        class="tw-absolute tw-right-4 tw-top-4 tw-rounded-sm tw-opacity-70 tw-transition-opacity hover:tw-opacity-100 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-ring"
      >
        <svg class="tw-h-4 tw-w-4 tw-text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        <span class="tw-sr-only">Close</span>
      </DialogClose>
    </RadixDialogContent>
  </DialogPortal>
</template>

<script setup lang="ts">
import { DialogClose, DialogContent as RadixDialogContent, DialogOverlay, DialogPortal } from 'radix-vue'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })

const emits = defineEmits<{
  escapeKeyDown: [event: KeyboardEvent]
  pointerDownOutside: [event: Event]
}>()
</script>
