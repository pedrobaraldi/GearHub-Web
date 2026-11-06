<template>
  <div class="relative">
    <AppIcon name="search" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gear-muted pointer-events-none" />
    <input
      :value="modelValue"
      type="search"
      :placeholder="placeholder"
      :aria-label="placeholder"
      class="field-input !pl-10"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string, placeholder: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
