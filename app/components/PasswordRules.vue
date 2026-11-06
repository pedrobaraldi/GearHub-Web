<template>
  <!-- Só orienta enquanto digita; quem valida e dá o erro é a API -->
  <ul class="grid grid-cols-2 sm:flex sm:justify-between gap-x-2 gap-y-1" aria-label="Requisitos da senha">
    <li
      v-for="rule in rules"
      :key="rule.label"
      class="flex items-center gap-1.5 text-xs whitespace-nowrap transition-colors"
      :class="rule.met ? 'text-gear-green' : 'text-gear-muted'"
    >
      <AppIcon :name="rule.met ? 'check' : 'circle'" class="w-3.5 h-3.5 shrink-0" />
      {{ rule.label }}
    </li>
  </ul>
</template>

<script setup lang="ts">
const props = defineProps<{ password: string }>()

const rules = computed(() => [
  { label: '8 caracteres', met: props.password.length >= 8 },
  { label: 'Letra maiúscula', met: /\p{Lu}/u.test(props.password) },
  { label: 'Número', met: /\d/.test(props.password) },
  { label: 'Caractere especial', met: /[^\p{L}\p{N}\s]/u.test(props.password) },
])
</script>
