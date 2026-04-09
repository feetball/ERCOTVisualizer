<template>
  <Sheet :open="open" @update:open="$emit('update:open', $event)">
    <SheetContent side="left" class="tw-p-0 tw-flex tw-flex-col">
      <SheetHeader class="tw-p-4 tw-pb-2">
        <SheetTitle class="tw-flex tw-items-center tw-gap-2">
          <Zap :size="18" class="tw-text-primary" />
          ERCOT Grid Monitor
        </SheetTitle>
        <SheetDescription>Dashboard views and navigation</SheetDescription>
      </SheetHeader>

      <nav class="tw-flex-1 tw-overflow-y-auto tw-px-2 tw-pb-4">
        <!-- Pre-defined Views -->
        <div class="tw-px-2 tw-py-2">
          <span class="tw-text-xs tw-font-medium tw-uppercase tw-tracking-wider tw-text-muted-foreground">
            Pre-defined Views
          </span>
        </div>

        <NavItem icon="line-chart" label="Grid Summary" @click="navigate('/')">
          <template #actions>
            <NavActionButton title="Copy to My Views" @click.stop="$emit('copyView', 'grid-summary', 'Grid Summary')">
              <Copy :size="14" />
            </NavActionButton>
          </template>
        </NavItem>

        <NavItem icon="monitor" label="Large Display" @click="navigate('/large-display')">
          <template #actions>
            <NavActionButton title="Copy to My Views" @click.stop="$emit('copyView', 'large-display', 'Large Display')">
              <Copy :size="14" />
            </NavActionButton>
          </template>
        </NavItem>

        <div class="tw-my-2 tw-mx-2 tw-h-px tw-bg-border/50" />

        <!-- My Views -->
        <div class="tw-px-2 tw-py-2">
          <span class="tw-text-xs tw-font-medium tw-uppercase tw-tracking-wider tw-text-muted-foreground">
            My Views
          </span>
        </div>

        <NavItem
          v-for="view in privateViews"
          :key="view.id"
          icon="layout-grid"
          :label="view.name"
          @click="navigate(`/view/${view.id}`)"
        >
          <template #actions>
            <NavActionButton title="Rename" @click.stop="$emit('editView', view.id, view.name)">
              <Pencil :size="14" />
            </NavActionButton>
            <NavActionButton title="Delete" @click.stop="$emit('deleteView', view.id)">
              <Trash2 :size="14" />
            </NavActionButton>
          </template>
        </NavItem>

        <!-- Public Views -->
        <div v-if="publicViews.length" class="tw-px-2 tw-py-2 tw-mt-1">
          <span class="tw-text-xs tw-font-medium tw-uppercase tw-tracking-wider tw-text-muted-foreground">
            Public Views
          </span>
        </div>

        <NavItem
          v-for="view in publicViews"
          :key="view.id"
          icon="globe"
          :label="view.name"
          @click="navigate(`/view/${view.id}`)"
        >
          <template #actions>
            <NavActionButton title="Rename" @click.stop="$emit('editView', view.id, view.name)">
              <Pencil :size="14" />
            </NavActionButton>
            <NavActionButton title="Delete" @click.stop="$emit('deleteView', view.id)">
              <Trash2 :size="14" />
            </NavActionButton>
          </template>
        </NavItem>

        <div class="tw-my-2 tw-mx-2 tw-h-px tw-bg-border/50" />

        <!-- Actions -->
        <NavItem icon="plus" label="New View" @click="$emit('newView')" />
        <NavItem icon="help-circle" label="Help" @click="navigate('/help')" />
      </nav>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Zap, Copy, Pencil, Trash2 } from 'lucide-vue-next'
import NavItem from './NavItem.vue'
import NavActionButton from './NavActionButton.vue'
import { useRouter } from 'vue-router'

defineProps<{
  open: boolean
  privateViews: Array<{ id: string; name: string }>
  publicViews: Array<{ id: string; name: string }>
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  copyView: [sourceKey: string, sourceName: string]
  editView: [viewId: string, currentName: string]
  deleteView: [viewId: string]
  newView: []
}>()

const router = useRouter()

function navigate(path: string) {
  emit('update:open', false)
  router.push(path)
}
</script>
