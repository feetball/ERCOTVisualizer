<template>
  <button :class="cn(buttonVariants({ variant, size }), $attrs.class as string)" :disabled="disabled">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-whitespace-nowrap tw-rounded-md tw-text-sm tw-font-medium tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring disabled:tw-pointer-events-none disabled:tw-opacity-50',
  {
    variants: {
      variant: {
        default: 'tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/90 tw-shadow-sm',
        destructive: 'tw-bg-destructive tw-text-destructive-foreground hover:tw-bg-destructive/90 tw-shadow-sm',
        outline: 'tw-border tw-border-border tw-bg-transparent hover:tw-bg-accent hover:tw-text-accent-foreground',
        secondary: 'tw-bg-secondary tw-text-secondary-foreground hover:tw-bg-secondary/80 tw-shadow-sm',
        ghost: 'hover:tw-bg-accent hover:tw-text-accent-foreground',
        link: 'tw-text-primary tw-underline-offset-4 hover:tw-underline',
      },
      size: {
        default: 'tw-h-9 tw-px-4 tw-py-2',
        sm: 'tw-h-8 tw-rounded-md tw-px-3 tw-text-xs',
        lg: 'tw-h-10 tw-rounded-md tw-px-8',
        icon: 'tw-h-9 tw-w-9',
        'icon-sm': 'tw-h-7 tw-w-7',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

type ButtonVariants = VariantProps<typeof buttonVariants>

withDefaults(defineProps<{
  variant?: NonNullable<ButtonVariants['variant']>
  size?: NonNullable<ButtonVariants['size']>
  disabled?: boolean
}>(), {
  variant: 'default',
  size: 'default',
  disabled: false,
})
</script>
