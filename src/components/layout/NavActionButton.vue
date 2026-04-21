<template>
  <button
    type="button"
    class="tw-flex tw-items-center tw-justify-center tw-h-6 tw-w-6 tw-rounded tw-text-muted-foreground hover:tw-text-foreground hover:tw-bg-accent tw-transition-colors"
    :title="title"
    @click.stop="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>
