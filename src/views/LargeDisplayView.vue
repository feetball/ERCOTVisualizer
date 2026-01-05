<template>
  <BaseGridView
    title="Large Display"
    storage-key="large-display-layout"
    :default-layout="defaultLayout"
    :allow-edit="false"
  />
</template>

<script setup lang="ts">
import BaseGridView from './BaseGridView.vue'
import { largeDisplayLayout } from './layouts/largeDisplayLayout'

const defaultLayout = largeDisplayLayout
</script>
