<template>
  <BaseGridView
    v-if="currentView"
    :title="viewName"
    :storage-key="`custom-view-${viewId}`"
    :default-layout="currentView.layout"
  />
  <v-container v-else class="d-flex align-center justify-center fill-height">
    <v-card max-width="400">
      <v-card-title>View Not Found</v-card-title>
      <v-card-text>The requested view does not exist or has been deleted.</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="flat" to="/">Go to Grid Summary</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useViewsStore } from '@/stores/views'
import BaseGridView from './BaseGridView.vue'

const route = useRoute()
const viewsStore = useViewsStore()

const viewId = computed(() => route.params.id as string)
const currentView = computed(() => viewsStore.getViewById(viewId.value))
const viewName = computed(() => currentView.value?.name || 'Custom View')
</script>
