<template>
  <DialogRoot v-bind="forwarded">
    <slot />
  </DialogRoot>
</template>

<script setup lang="ts">
import { DialogRoot, useForwardPropsEmits } from 'radix-vue'

const props = defineProps<{
  open?: boolean
  defaultOpen?: boolean
  modal?: boolean
}>()

const emits = defineEmits<{
  'update:open': [value: boolean]
}>()

const forwarded = useForwardPropsEmits(props, emits)
</script>
