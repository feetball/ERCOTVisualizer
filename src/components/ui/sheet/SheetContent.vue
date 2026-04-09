<template>
  <DialogPortal>
    <DialogOverlay
      class="tw-fixed tw-inset-0 tw-z-50 tw-bg-black/60 tw-backdrop-blur-sm data-[state=open]:tw-animate-in data-[state=closed]:tw-animate-out data-[state=closed]:tw-fade-out-0 data-[state=open]:tw-fade-in-0"
    />
    <RadixDialogContent
      :class="cn(sheetVariants({ side }), $attrs.class as string)"
      v-bind="{ ...$attrs, class: undefined }"
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
import { cva, type VariantProps } from 'class-variance-authority'

const sheetVariants = cva(
  'tw-fixed tw-z-50 tw-gap-4 tw-shadow-2xl tw-transition tw-ease-in-out data-[state=open]:tw-animate-in data-[state=closed]:tw-animate-out data-[state=closed]:tw-duration-300 data-[state=open]:tw-duration-300',
  {
    variants: {
      side: {
        left: 'tw-inset-y-0 tw-left-0 tw-h-full tw-w-72 tw-border-r tw-border-border glass-card-solid data-[state=closed]:tw-slide-out-to-left data-[state=open]:tw-slide-in-from-left',
        right: 'tw-inset-y-0 tw-right-0 tw-h-full tw-w-72 tw-border-l tw-border-border glass-card-solid data-[state=closed]:tw-slide-out-to-right data-[state=open]:tw-slide-in-from-right',
        top: 'tw-inset-x-0 tw-top-0 tw-border-b tw-border-border glass-card-solid data-[state=closed]:tw-slide-out-to-top data-[state=open]:tw-slide-in-from-top',
        bottom: 'tw-inset-x-0 tw-bottom-0 tw-border-t tw-border-border glass-card-solid tw-rounded-t-xl data-[state=closed]:tw-slide-out-to-bottom data-[state=open]:tw-slide-in-from-bottom',
      },
    },
    defaultVariants: {
      side: 'left',
    },
  }
)

type SheetVariants = VariantProps<typeof sheetVariants>

withDefaults(defineProps<{
  side?: NonNullable<SheetVariants['side']>
}>(), {
  side: 'left',
})

defineOptions({ inheritAttrs: false })
</script>
