<template>
  <div class="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
    <button
      v-for="filter in FEED_FILTERS"
      :key="filter.value"
      class="pill"
      :class="modelValue === filter.value ? 'pill-active' : 'pill-idle'"
      :aria-pressed="modelValue === filter.value"
      @click="$emit('update:modelValue', filter.value)"
    >
      {{ filter.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { FEED_FILTERS } from '~/composables/useGearData'

defineProps<{ modelValue: string }>()
defineEmits<{ 'update:modelValue': [v: string] }>()
</script>
