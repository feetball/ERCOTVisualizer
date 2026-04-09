<template>
  <div class="app-root">
    <!-- Header -->
    <AppHeader @toggle-nav="drawerOpen = !drawerOpen" />

    <!-- Side Navigation -->
    <SideNav
      v-model:open="drawerOpen"
      :private-views="privateViews"
      :public-views="publicViews"
      @copy-view="copyView"
      @edit-view="confirmEditView"
      @delete-view="confirmDeleteView"
      @new-view="newViewOpen = true"
    />

    <!-- Main Content -->
    <main class="app-main aurora-bg noise-overlay">
      <router-view />
    </main>

    <!-- Mobile Bottom Nav -->
    <MobileNav />

    <!-- Version Display -->
    <div class="version-display">v{{ version }}</div>

    <!-- Welcome Dialog -->
    <WelcomeDialog />

    <!-- Vercel Web Analytics -->
    <Analytics />

    <!-- Dialogs -->
    <NewViewDialog
      v-model:open="newViewOpen"
      @create="createNewView"
    />
    <DeleteViewDialog
      v-model:open="deleteOpen"
      @confirm="deleteView"
    />
    <RenameViewDialog
      v-model:open="editOpen"
      :current-name="editViewName"
      @save="saveViewName"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useViewsStore } from '@/stores/views'
import { Analytics } from '@vercel/analytics/vue'
import packageInfo from '../package.json'
import { gridSummaryLayout } from '@/views/layouts/gridSummaryLayout'
import { largeDisplayLayout } from '@/views/layouts/largeDisplayLayout'

import AppHeader from '@/components/layout/AppHeader.vue'
import SideNav from '@/components/layout/SideNav.vue'
import MobileNav from '@/components/layout/MobileNav.vue'
import WelcomeDialog from '@/components/common/WelcomeDialog.vue'
import NewViewDialog from '@/components/dialogs/NewViewDialog.vue'
import DeleteViewDialog from '@/components/dialogs/DeleteViewDialog.vue'
import RenameViewDialog from '@/components/dialogs/RenameViewDialog.vue'

const router = useRouter()
const viewsStore = useViewsStore()
const version = (packageInfo as { version: string }).version

// Navigation drawer
const drawerOpen = ref(false)

// Dialog state
const newViewOpen = ref(false)
const deleteOpen = ref(false)
const editOpen = ref(false)
const viewToDelete = ref<string | null>(null)
const viewToEdit = ref<string | null>(null)
const editViewName = ref('')

const privateViews = computed(() => viewsStore.privateViews)
const publicViews = computed(() => viewsStore.publicViews)

function copyView(sourceKey: string, sourceName: string) {
  const newView = viewsStore.createView(`${sourceName} (Copy)`, false)
  let layoutToCopy: typeof gridSummaryLayout = []
  if (sourceKey === 'grid-summary') layoutToCopy = gridSummaryLayout
  else if (sourceKey === 'large-display') layoutToCopy = largeDisplayLayout
  if (layoutToCopy.length > 0) viewsStore.updateViewLayout(newView.id, layoutToCopy)
  drawerOpen.value = false
  router.push(`/view/${newView.id}`)
}

function createNewView(name: string, isPublic: boolean) {
  const newView = viewsStore.createView(name, isPublic)
  newViewOpen.value = false
  drawerOpen.value = false
  router.push(`/view/${newView.id}`)
}

function confirmDeleteView(viewId: string) {
  viewToDelete.value = viewId
  deleteOpen.value = true
}

function deleteView() {
  if (viewToDelete.value) {
    viewsStore.deleteView(viewToDelete.value)
    viewToDelete.value = null
  }
  deleteOpen.value = false
}

function confirmEditView(viewId: string, currentName: string) {
  viewToEdit.value = viewId
  editViewName.value = currentName
  editOpen.value = true
}

function saveViewName(name: string) {
  if (viewToEdit.value) {
    viewsStore.updateViewName(viewToEdit.value, name)
    viewToEdit.value = null
  }
  editOpen.value = false
  editViewName.value = ''
}
</script>

<style scoped>
.app-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: var(--font-sans);
}

.app-main {
  flex: 1;
  overflow-y: auto;
  position: relative;
}

/* Mobile: add bottom padding for the bottom nav bar */
@media (max-width: 768px) {
  .app-main {
    padding-bottom: 56px;
  }
}

.version-display {
  position: fixed;
  bottom: 8px;
  right: 12px;
  font-size: 11px;
  color: hsl(var(--muted-foreground));
  opacity: 0.4;
  z-index: 1000;
  pointer-events: none;
  font-family: var(--font-mono);
}

@media (max-width: 768px) {
  .version-display {
    bottom: 64px;
  }
}
</style>
