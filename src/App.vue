<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app temporary width="260">
      <v-list>
        <v-list-item>
          <v-list-item-title class="text-h6">ERCOT Grid Monitor</v-list-item-title>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-subheader>Pre-defined Views</v-list-subheader>
        <v-list-item @click="navigate('/')" link prepend-icon="mdi-chart-line">
          <v-list-item-title>Grid Summary</v-list-item-title>
          <template #append>
            <v-btn
              icon="mdi-content-copy"
              variant="text"
              size="x-small"
              title="Copy to My Views"
              @click.stop="copyView('grid-summary', 'Grid Summary')"
            ></v-btn>
          </template>
        </v-list-item>

        <v-list-item @click="navigate('/large-display')" link prepend-icon="mdi-monitor">
          <v-list-item-title>Large Display</v-list-item-title>
          <template #append>
            <v-btn
              icon="mdi-content-copy"
              variant="text"
              size="x-small"
              title="Copy to My Views"
              @click.stop="copyView('large-display', 'Large Display')"
            ></v-btn>
          </template>
        </v-list-item>

        <v-divider class="my-2"></v-divider>

        <v-list-subheader>My Views</v-list-subheader>
        <v-list-item
          v-for="view in privateViews"
          :key="view.id"
          @click="navigate(`/view/${view.id}`)"
          link
          prepend-icon="mdi-view-grid"
        >
          <v-list-item-title>{{ view.name }}</v-list-item-title>
          <template #append>
            <v-btn
              icon="mdi-delete"
              variant="text"
              size="x-small"
              @click.stop="confirmDeleteView(view.id)"
            ></v-btn>
          </template>
        </v-list-item>

        <v-list-subheader>Public Views</v-list-subheader>
        <v-list-item
          v-for="view in publicViews"
          :key="view.id"
          @click="navigate(`/view/${view.id}`)"
          link
          prepend-icon="mdi-view-grid-outline"
        >
          <v-list-item-title>{{ view.name }}</v-list-item-title>
          <template #append>
            <v-btn
              icon="mdi-delete"
              variant="text"
              size="x-small"
              @click.stop="confirmDeleteView(view.id)"
            ></v-btn>
          </template>
        </v-list-item>

        <v-list-item @click="showNewViewDialog = true" link prepend-icon="mdi-plus">
          <v-list-item-title>New View</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2"></v-divider>

        <v-list-item @click="navigate('/help')" link prepend-icon="mdi-help-circle">
          <v-list-item-title>Help</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app density="compact" :height="45" class="app-bar-dark">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title class="text-body-1">ERCOT Grid Monitor</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon size="small" @click="toggleTheme">
        <v-icon size="18">mdi-theme-light-dark</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>

    <!-- Version Display -->
    <div class="version-display">
      v{{ version }}
    </div>

    <!-- Welcome Dialog -->
    <WelcomeDialog />

    <!-- New View Dialog -->
    <v-dialog v-model="showNewViewDialog" max-width="500">
      <v-card>
        <v-card-title>Create New View</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newViewName"
            label="View Name"
            placeholder="My Custom View"
            variant="outlined"
            density="compact"
            class="mb-2"
          ></v-text-field>
          <v-checkbox
            v-model="newViewIsPublic"
            label="Make this view public (visible to all users)"
            density="compact"
          ></v-checkbox>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showNewViewDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" @click="createNewView" :disabled="!newViewName.trim()">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>Delete View</v-card-title>
        <v-card-text>Are you sure you want to delete this view? This action cannot be undone.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="deleteView">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'
import { useRouter } from 'vue-router'
import { useViewsStore } from '@/stores/views'
import WelcomeDialog from '@/components/common/WelcomeDialog.vue'
import packageInfo from '../package.json'
import { gridSummaryLayout } from '@/views/layouts/gridSummaryLayout'
import { largeDisplayLayout } from '@/views/layouts/largeDisplayLayout'

const theme = useTheme()
const router = useRouter()
const viewsStore = useViewsStore()
const drawer = ref(false)
const showNewViewDialog = ref(false)
const showDeleteDialog = ref(false)
const newViewName = ref('')
const newViewIsPublic = ref(false)
const viewToDelete = ref<string | null>(null)
const version = (packageInfo as { version: string }).version

const privateViews = computed(() => viewsStore.privateViews)
const publicViews = computed(() => viewsStore.publicViews)

function toggleTheme() {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

function navigate(path: string) {
  drawer.value = false
  router.push(path)
}

function copyView(sourceKey: string, sourceName: string) {
  const newView = viewsStore.createView(`${sourceName} (Copy)`, false)
  
  // Get the layout based on the source key
  let layoutToCopy: typeof gridSummaryLayout = []
  if (sourceKey === 'grid-summary') {
    layoutToCopy = gridSummaryLayout
  } else if (sourceKey === 'large-display') {
    layoutToCopy = largeDisplayLayout
  }
  
  if (layoutToCopy.length > 0) {
    // Update the view's layout in the store
    viewsStore.updateViewLayout(newView.id, layoutToCopy)
  }
  
  drawer.value = false
  router.push(`/view/${newView.id}`)
}

function createNewView() {
  const trimmedName = newViewName.value.trim()
  if (!trimmedName || trimmedName.length < 2) return
  
  const newView = viewsStore.createView(trimmedName, newViewIsPublic.value)
  
  // Reset form
  showNewViewDialog.value = false
  newViewName.value = ''
  newViewIsPublic.value = false
  drawer.value = false
  
  // Navigate to the new view
  router.push(`/view/${newView.id}`)
}

function confirmDeleteView(viewId: string) {
  viewToDelete.value = viewId
  showDeleteDialog.value = true
}

function deleteView() {
  if (viewToDelete.value) {
    viewsStore.deleteView(viewToDelete.value)
    viewToDelete.value = null
  }
  showDeleteDialog.value = false
}
</script>

<style scoped>
.version-display {
  position: fixed;
  bottom: 8px;
  right: 12px;
  font-size: 11px;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.4;
  z-index: 1000;
  pointer-events: none;
  font-family: monospace;
}

/* Dark app bar - differentiated from view content */
.app-bar-dark {
  background: linear-gradient(90deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%) !important;
  border-bottom: 1px solid rgba(88, 166, 255, 0.3);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.4) !important;
}

:deep(.v-app-bar-title) {
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

/* Navigation drawer styling */
:deep(.v-navigation-drawer) {
  background: linear-gradient(180deg, 
    rgba(var(--v-theme-surface), 0.98) 0%, 
    rgba(var(--v-theme-background), 1) 100%) !important;
  border-right: 1px solid rgba(var(--v-theme-primary), 0.2) !important;
}

:deep(.v-navigation-drawer .v-list-item:hover) {
  background: linear-gradient(90deg, 
    rgba(var(--v-theme-primary), 0.1) 0%, 
    transparent 100%);
}

:deep(.v-navigation-drawer .v-list-item--active) {
  background: linear-gradient(90deg, 
    rgba(var(--v-theme-primary), 0.2) 0%, 
    rgba(var(--v-theme-secondary), 0.1) 100%);
  border-left: 3px solid rgb(var(--v-theme-primary));
}

/* Dialog styling */
:deep(.v-dialog .v-card) {
  background: linear-gradient(145deg, 
    rgba(var(--v-theme-surface), 0.98) 0%, 
    rgba(var(--v-theme-surface-bright), 0.95) 100%) !important;
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 60px rgba(var(--v-theme-primary), 0.1) !important;
}
</style>
