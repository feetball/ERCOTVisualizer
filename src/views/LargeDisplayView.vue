<template>
  <div class="fill-height bg-black d-flex flex-column">
    <v-toolbar density="compact" color="grey-darken-4">
      <v-toolbar-title>Large Display Controller</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn prepend-icon="mdi-plus" @click="addDashboard">Add Dashboard</v-btn>
    </v-toolbar>

    <div class="flex-grow-1 overflow-hidden">
      <GridLayout
        v-model:layout="layout"
        :col-num="12"
        :row-height="30"
        :is-draggable="true"
        :is-resizable="true"
        :vertical-compact="true"
        :use-css-transforms="true"
      >
        <GridItem
          v-for="item in layout"
          :key="item.i"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          class="bg-surface border"
        >
          <div class="fill-height d-flex flex-column">
            <div class="bg-grey-darken-3 px-2 py-1 d-flex justify-space-between align-center">
              <span class="text-caption">Dashboard {{ item.i }}</span>
              <v-btn icon="mdi-close" size="x-small" variant="text" color="error" @click="removeDashboard(item.i)"></v-btn>
            </div>
            <div class="flex-grow-1 position-relative">
              <!-- In a real app, this would render the Dashboard component with a specific ID -->
              <div class="d-flex align-center justify-center fill-height text-grey">
                Dashboard Content Placeholder
              </div>
            </div>
          </div>
        </GridItem>
      </GridLayout>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { GridLayout, GridItem } from 'grid-layout-plus'

const layout = ref([
  { i: '1', x: 0, y: 0, w: 6, h: 10 },
  { i: '2', x: 6, y: 0, w: 6, h: 10 }
])

function addDashboard() {
  layout.value.push({
    i: Date.now().toString(),
    x: 0,
    y: 0,
    w: 4,
    h: 8
  })
}

function removeDashboard(id: string) {
  const index = layout.value.findIndex(item => item.i === id)
  if (index !== -1) layout.value.splice(index, 1)
}
</script>
