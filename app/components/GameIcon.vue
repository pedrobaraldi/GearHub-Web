<template>
  <span class="grid place-items-center rounded-full bg-gear-surface text-gear-text shrink-0" aria-hidden="true">
    <!-- Máscara: os arquivos são pretos, e assim o ícone segue a cor do tema -->
    <span v-if="hasIcon" class="block w-[62%] h-[62%] bg-current" :style="maskStyle" />
    <span v-else class="font-display italic font-extrabold">{{ name.charAt(0) }}</span>
  </span>
</template>

<script setup lang="ts">
const ICONS = ['valorant', 'cs2', 'apex-legends', 'fortnite', 'overwatch-2', 'rainbow-six-siege']

const props = defineProps<{ slug: string, name: string }>()

const hasIcon = computed(() => ICONS.includes(props.slug))

const maskStyle = computed(() => {
  const mask = `url(/games/${props.slug}.svg) center / contain no-repeat`
  return { mask, WebkitMask: mask }
})
</script>
