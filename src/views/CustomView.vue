<template>
  <BaseGridView
    v-if="currentView"
    :title="viewName"
    :storage-key="`custom-view-${viewId}`"
    :default-layout="currentView.layout"
  />
  <div v-else class="tw-flex tw-items-center tw-justify-center tw-h-full">
    <div class="glass-card-solid tw-max-w-sm tw-p-6 tw-text-center">
      <h2 class="tw-text-lg tw-font-semibold tw-text-foreground tw-mb-2">View Not Found</h2>
      <p class="tw-text-sm tw-text-muted-foreground tw-mb-4">The requested view does not exist or has been deleted.</p>
      <router-link to="/" class="tw-inline-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-rounded-md tw-bg-primary tw-text-primary-foreground tw-text-sm tw-font-medium hover:tw-bg-primary/90 tw-transition-colors">
        Go to Grid Summary
      </router-link>
    </div>
  </div>
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
