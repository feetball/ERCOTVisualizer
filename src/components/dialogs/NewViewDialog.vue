<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="tw-max-w-md">
      <DialogHeader>
        <DialogTitle>Create New View</DialogTitle>
        <DialogDescription>Set up a new custom dashboard view.</DialogDescription>
      </DialogHeader>

      <div class="tw-flex tw-flex-col tw-gap-4 tw-py-2">
        <div class="tw-flex tw-flex-col tw-gap-2">
          <label class="tw-text-sm tw-font-medium tw-text-foreground" for="view-name">
            View Name
          </label>
          <Input
            id="view-name"
            v-model="name"
            placeholder="My Custom View"
            @keyup.enter="create"
          />
        </div>
        <Checkbox v-model="isPublic">
          Make this view public (visible to all users)
        </Checkbox>
      </div>

      <DialogFooter>
        <Button variant="ghost" @click="$emit('update:open', false)">Cancel</Button>
        <Button @click="create" :disabled="!name.trim()">Create</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  create: [name: string, isPublic: boolean]
}>()

const name = ref('')
const isPublic = ref(false)

function create() {
  const trimmed = name.value.trim()
  if (!trimmed || trimmed.length < 2) return
  emit('create', trimmed, isPublic.value)
  name.value = ''
  isPublic.value = false
}
</script>
