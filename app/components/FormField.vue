<template>
  <div>
    <label :for="id" :class="eyebrow ? 'form-label' : 'block text-sm font-medium mb-1.5'">{{ label }}</label>
    <div class="relative">
      <input
        :id="id"
        :value="modelValue"
        :type="inputType"
        :autocomplete="autocomplete"
        :placeholder="placeholder"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error || hint ? `${id}-ajuda` : undefined"
        class="w-full bg-gear-surface border rounded-xl px-4 py-2.5 text-base sm:text-sm text-gear-text placeholder-gear-muted transition-colors"
        :class="[error ? 'border-gear-red' : 'border-gear-border', { 'pr-11': type === 'password' }]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        v-if="type === 'password'"
        type="button"
        class="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 grid place-items-center rounded-lg text-gear-muted hover:text-gear-text transition-colors"
        :aria-label="visible ? 'Ocultar senha' : 'Mostrar senha'"
        :aria-pressed="visible"
        @click="visible = !visible"
      >
        <AppIcon :name="visible ? 'eye-off' : 'eye'" class="w-4 h-4" />
      </button>
    </div>
    <p v-if="error" :id="`${id}-ajuda`" class="text-xs text-gear-red mt-1.5">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-ajuda`" class="text-xs text-gear-muted mt-1.5">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  id: string
  label: string
  modelValue?: string
  type?: string
  autocomplete?: string
  error?: string
  hint?: string
  eyebrow?: boolean
  placeholder?: string
}>(), { modelValue: '', type: 'text', autocomplete: undefined, error: undefined, hint: undefined, placeholder: undefined })

defineEmits<{ 'update:modelValue': [value: string] }>()

const visible = ref(false)
const inputType = computed(() => (props.type === 'password' && visible.value ? 'text' : props.type))
</script>
