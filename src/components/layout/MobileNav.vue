<template>
  <nav class="mobile-nav">
    <button
      v-for="item in items"
      :key="item.path"
      class="mobile-nav-item"
      :class="{ active: isActive(item.path) }"
      @click="$router.push(item.path)"
    >
      <component :is="item.icon" :size="20" />
      <span>{{ item.label }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { LayoutDashboard, Layers, HelpCircle } from 'lucide-vue-next'

const route = useRoute()

const items = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/large-display', label: 'Display', icon: Layers },
  { path: '/help', label: 'Help', icon: HelpCircle },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/' || route.path === '/grid-summary'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.mobile-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  height: 56px;
  background: hsl(var(--card));
  border-top: 1px solid hsla(var(--border), 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 0 8px;
}

@media (max-width: 768px) {
  .mobile-nav {
    display: flex;
    align-items: center;
    justify-content: space-around;
  }
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
  transition: all 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

.mobile-nav-item.active {
  color: hsl(var(--primary));
}

.mobile-nav-item:active {
  transform: scale(0.92);
}
</style>
