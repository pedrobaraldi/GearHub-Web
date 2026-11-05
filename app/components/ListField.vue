<template>
  <div>
    <span class="form-label">{{ label }}</span>
    <div class="space-y-2">
      <div v-for="(item, index) in modelValue" :key="index" class="relative">
        <input
          :value="item"
          :aria-label="`${label} ${index + 1}`"
          :placeholder="placeholder"
          class="field-input"
          :class="{ 'pr-10': modelValue.length > 1 }"
          @input="update(index, ($event.target as HTMLInputElement).value)"
        />
        <button
          v-if="modelValue.length > 1"
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 grid place-items-center text-gear-muted hover:text-gear-red transition-colors"
          :aria-label="`Remover ${label} ${index + 1}`"
          @click="remove(index)"
        >
          <AppIcon name="x" class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
    <p v-if="error" class="text-xs text-gear-red mt-1.5">{{ error }}</p>
    <button
      v-if="modelValue.length < MAX_ITEMS"
      type="button"
      class="inline-flex items-center gap-1.5 text-xs font-medium text-gear-accent mt-2 hover:opacity-80 transition-opacity"
      @click="$emit('update:modelValue', [...modelValue, ''])"
    >
      <AppIcon name="plus" class="w-3.5 h-3.5" />
      Adicionar
    </button>
  </div>
</template>

<script setup lang="ts">
const MAX_ITEMS = 10

const props = defineProps<{
  label: string
  modelValue: string[]
  placeholder?: string
  error?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()

function update(index: number, value: string) {
  emit('update:modelValue', props.modelValue.map((item, position) => (position === index ? value : item)))
}

function remove(index: number) {
  emit('update:modelValue', props.modelValue.filter((_, position) => position !== index))
}
</script>
