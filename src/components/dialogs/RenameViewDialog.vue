<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="tw-max-w-md">
      <DialogHeader>
        <DialogTitle>Rename View</DialogTitle>
      </DialogHeader>

      <div class="tw-py-2">
        <Input
          v-model="localName"
          placeholder="View name"
          autofocus
          @keyup.enter="save"
        />
      </div>

      <DialogFooter>
        <Button variant="ghost" @click="$emit('update:open', false)">Cancel</Button>
        <Button @click="save" :disabled="!localName.trim()">Save</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const props = defineProps<{
  open: boolean
  currentName: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [name: string]
}>()

const localName = ref(props.currentName)

watch(() => props.currentName, (val) => {
  localName.value = val
})

function save() {
  const trimmed = localName.value.trim()
  if (!trimmed || trimmed.length < 2) return
  emit('save', trimmed)
}
</script>
