<template>
  <BaseGridView
    title="Grid Summary"
    storage-key="grid-summary-layout"
    :default-layout="defaultLayout"
    :allow-edit="false"
  />
</template>

<script setup lang="ts">
import BaseGridView from './BaseGridView.vue'
import { gridSummaryLayout } from './layouts/gridSummaryLayout'

const defaultLayout = gridSummaryLayout
</script>
