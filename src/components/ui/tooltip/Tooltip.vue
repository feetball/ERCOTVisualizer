<template>
  <TooltipProvider :delay-duration="200">
    <TooltipRoot>
      <TooltipTrigger as-child>
        <slot />
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          :side="side"
          :class="cn(
            'tw-z-50 tw-overflow-hidden tw-rounded-md tw-px-3 tw-py-1.5 tw-text-xs tw-text-popover-foreground tw-shadow-md tw-animate-fade-in',
            'glass-card-solid',
            $attrs.class as string
          )"
          :side-offset="5"
        >
          {{ content }}
          <slot name="content" />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>

<script setup lang="ts">
import {
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from 'radix-vue'
import { cn } from '@/lib/utils'

withDefaults(defineProps<{
  content?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
}>(), {
  content: '',
  side: 'top',
})
</script>
