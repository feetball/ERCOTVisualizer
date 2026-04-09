<template>
  <header class="app-header">
    <div class="tw-flex tw-items-center tw-gap-3">
      <button
        class="tw-flex tw-items-center tw-justify-center tw-h-8 tw-w-8 tw-rounded-md tw-text-foreground/70 hover:tw-text-foreground hover:tw-bg-accent tw-transition-colors"
        @click="$emit('toggleNav')"
        aria-label="Toggle navigation"
      >
        <Menu :size="18" />
      </button>

      <div class="tw-flex tw-items-center tw-gap-2">
        <div class="header-glow-dot" />
        <h1 class="tw-text-sm tw-font-bold tw-tracking-wider tw-uppercase tw-text-foreground">
          ERCOT Grid Monitor
        </h1>
      </div>
    </div>

    <div class="tw-flex tw-items-center tw-gap-1">
      <Tooltip content="Toggle theme">
        <button
          class="tw-flex tw-items-center tw-justify-center tw-h-8 tw-w-8 tw-rounded-md tw-text-foreground/70 hover:tw-text-foreground hover:tw-bg-accent tw-transition-colors"
          @click="toggle"
          aria-label="Toggle theme"
        >
          <Moon v-if="isDark" :size="16" />
          <Sun v-else :size="16" />
        </button>
      </Tooltip>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Menu, Moon, Sun } from 'lucide-vue-next'
import { Tooltip } from '@/components/ui/tooltip'
import { useThemeMode } from '@/composables/useThemeMode'

const { isDark, toggle } = useThemeMode()

defineEmits<{
  toggleNav: []
}>()
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  background: linear-gradient(
    90deg,
    hsl(var(--background)) 0%,
    hsla(var(--card), 0.8) 50%,
    hsl(var(--background)) 100%
  );
  border-bottom: 1px solid hsla(var(--border), 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 40;
}

.header-glow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: hsl(var(--primary));
  box-shadow: 0 0 8px hsl(var(--primary)), 0 0 16px hsla(var(--primary), 0.4);
  animation: glow-pulse 3s ease-in-out infinite;
}
</style>
