<template>
  <div>
    <span :id="`${id}-rotulo`" class="block text-sm font-medium mb-1.5">{{ label }}</span>
    <div role="group" :aria-labelledby="`${id}-rotulo`" class="flex gap-1 p-1 h-[46px] sm:h-[42px] rounded-xl border bg-gear-surface" :class="error ? 'border-gear-red' : 'border-gear-border'">
      <button
        v-for="option in options"
        :key="option"
        type="button"
        class="flex-1 rounded-lg text-sm font-medium transition-colors"
        :class="modelValue === option ? 'bg-gear-primary text-gear-on-primary' : 'text-gear-muted hover:text-gear-text'"
        :aria-pressed="modelValue === option"
        @click="$emit('update:modelValue', modelValue === option ? '' : option)"
      >
        {{ option }}
      </button>
    </div>
    <p v-if="error" class="text-xs text-gear-red mt-1.5">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ id: string, label: string, options: string[], modelValue?: string, error?: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
