<template>
  <span :class="cn(badgeVariants({ variant }), $attrs.class as string)">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  'tw-inline-flex tw-items-center tw-rounded-md tw-border tw-px-2.5 tw-py-0.5 tw-text-xs tw-font-semibold tw-transition-colors',
  {
    variants: {
      variant: {
        default: 'tw-border-transparent tw-bg-primary tw-text-primary-foreground',
        secondary: 'tw-border-transparent tw-bg-secondary tw-text-secondary-foreground',
        destructive: 'tw-border-transparent tw-bg-destructive tw-text-destructive-foreground',
        outline: 'tw-border-border tw-text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

type BadgeVariants = VariantProps<typeof badgeVariants>

withDefaults(defineProps<{
  variant?: NonNullable<BadgeVariants['variant']>
}>(), {
  variant: 'default',
})
</script>
