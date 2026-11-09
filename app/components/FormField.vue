<template>
  <div>
    <label :for="id" :class="eyebrow ? 'form-label' : 'block text-sm font-medium mb-1.5'">
      {{ label }}<span v-if="required" class="text-gear-accent" title="Obrigatório" aria-hidden="true"> *</span>
    </label>
    <div class="relative">
      <input
        :id="id"
        :value="modelValue"
        :type="inputType"
        :autocomplete="autocomplete"
        :placeholder="placeholder"
        :inputmode="inputmode"
        :list="options?.length ? `${id}-opcoes` : undefined"
        :aria-required="required ? 'true' : undefined"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error || hint ? `${id}-ajuda` : undefined"
        class="field-input"
        :class="[{ 'field-error': error }, { 'pr-11': type === 'password' || suffix }]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <datalist v-if="options?.length" :id="`${id}-opcoes`">
        <option v-for="option in options" :key="option" :value="option" />
      </datalist>
      <span v-if="suffix" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gear-muted pointer-events-none">{{ suffix }}</span>
      <button
        v-if="type === 'password'"
        type="button"
        class="absolute right-1 sm:right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-8 sm:h-8 grid place-items-center rounded-lg text-gear-muted hover:text-gear-text transition-colors"
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
  /** Sugestões: a pessoa também pode digitar outro valor */
  options?: string[]
  required?: boolean
  suffix?: string
  inputmode?: 'decimal' | 'numeric' | 'text'
}>(), { modelValue: '', type: 'text', autocomplete: undefined, error: undefined, hint: undefined, placeholder: undefined, options: undefined, suffix: undefined, inputmode: undefined })

defineEmits<{ 'update:modelValue': [value: string] }>()

const visible = ref(false)
const inputType = computed(() => (props.type === 'password' && visible.value ? 'text' : props.type))
</script>
