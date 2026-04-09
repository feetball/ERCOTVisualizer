<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="tw-max-w-sm">
      <DialogHeader>
        <DialogTitle>Delete View</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this view? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter>
        <Button variant="ghost" @click="$emit('update:open', false)">Cancel</Button>
        <Button variant="destructive" @click="$emit('confirm')">Delete</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

defineProps<{
  open: boolean
}>()

defineEmits<{
  'update:open': [value: boolean]
  confirm: []
}>()
</script>
