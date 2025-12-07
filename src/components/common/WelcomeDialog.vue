<template>
  <v-dialog v-model="showDialog" max-width="600" persistent>
    <v-card class="welcome-card">
      <v-card-title class="welcome-title d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-lightning-bolt</v-icon>
        Welcome to ERCOT Grid Monitor
      </v-card-title>
      
      <v-card-text class="pa-4">
        <p class="text-body-1 mb-4">
          Monitor real-time ERCOT grid operations with customizable dashboards.
        </p>
        
        <v-list density="compact" class="mb-4 bg-transparent">
          <v-list-item prepend-icon="mdi-view-dashboard">
            <v-list-item-title><strong>Pre-built Views</strong></v-list-item-title>
            <v-list-item-subtitle>Grid Summary and Large Display views come ready to use</v-list-item-subtitle>
          </v-list-item>
          
          <v-list-item prepend-icon="mdi-pencil-ruler">
            <v-list-item-title><strong>Editable Layouts</strong></v-list-item-title>
            <v-list-item-subtitle>Click "Edit" to drag, resize, and customize your views</v-list-item-subtitle>
          </v-list-item>
          
          <v-list-item prepend-icon="mdi-widgets">
            <v-list-item-title><strong>Widget Library</strong></v-list-item-title>
            <v-list-item-subtitle>Charts, stats, gauges, and more to visualize grid data</v-list-item-subtitle>
          </v-list-item>
          
          <v-list-item prepend-icon="mdi-plus-circle">
            <v-list-item-title><strong>Custom Views</strong></v-list-item-title>
            <v-list-item-subtitle>Create your own dashboards from the navigation menu</v-list-item-subtitle>
          </v-list-item>
          
          <v-list-item prepend-icon="mdi-alert-circle">
            <v-list-item-title><strong>Alert Indicators</strong></v-list-item-title>
            <v-list-item-subtitle>Color-coded status for frequency, reserves, load, and price</v-list-item-subtitle>
          </v-list-item>
        </v-list>
        
        <v-alert type="info" variant="tonal" density="compact" class="mb-4">
          <template #prepend>
            <v-icon>mdi-information</v-icon>
          </template>
          Pre-defined views (Grid Summary, Large Display) cannot be permanently modified. 
          Create a custom view to build your own layout.
        </v-alert>
        
        <div class="d-flex align-center justify-space-between">
          <v-checkbox 
            v-model="dontShowAgain" 
            label="Don't show this again" 
            density="compact"
            hide-details
            class="flex-shrink-0"
          ></v-checkbox>
          
          <v-btn 
            variant="text" 
            size="small" 
            color="primary"
            @click="goToHelp"
          >
            <v-icon start>mdi-help-circle</v-icon>
            More Help
          </v-btn>
        </div>
      </v-card-text>
      
      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn 
          color="primary" 
          variant="flat" 
          size="large"
          @click="dismiss"
        >
          Get Started
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const STORAGE_KEY = 'ercot-welcome-dismissed'

const router = useRouter()
const showDialog = ref(false)
const dontShowAgain = ref(false)

onMounted(() => {
  const dismissed = localStorage.getItem(STORAGE_KEY)
  if (!dismissed) {
    showDialog.value = true
  }
})

function dismiss() {
  if (dontShowAgain.value) {
    localStorage.setItem(STORAGE_KEY, 'true')
  }
  showDialog.value = false
}

function goToHelp() {
  dismiss()
  router.push('/help')
}
</script>

<style scoped>
.welcome-card {
  background: linear-gradient(145deg, 
    rgba(var(--v-theme-surface), 0.98) 0%, 
    rgba(var(--v-theme-surface-bright), 0.95) 100%) !important;
  border: 1px solid rgba(var(--v-theme-primary), 0.3);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 60px rgba(var(--v-theme-primary), 0.15) !important;
}

.welcome-title {
  background: linear-gradient(90deg, 
    rgba(var(--v-theme-primary), 0.2) 0%, 
    rgba(var(--v-theme-secondary), 0.1) 100%);
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.2);
  font-weight: 600;
}

.welcome-card :deep(.v-list-item) {
  padding: 8px 0;
}

.welcome-card :deep(.v-list-item__prepend) {
  margin-right: 12px;
}

.welcome-card :deep(.v-list-item .v-icon) {
  color: rgb(var(--v-theme-primary));
}
</style>
