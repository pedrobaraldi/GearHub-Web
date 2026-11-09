<template>
  <!-- Insígnias em public/badges: animada só onde ganha destaque; o hover toca a entrada de novo -->
  <img
    :src="src"
    :alt="title"
    class="object-contain select-none"
    :class="stateClass"
    draggable="false"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  />
</template>

<script setup lang="ts">
const props = defineProps<{ badge: string, title: string, animated?: boolean, locked?: boolean, noHover?: boolean }>()

// A chave vem da API e vira nome de arquivo: só letras, números e hífen
const { src, onEnter, onLeave, stateClass } = useEmblemSource(
  'badges',
  () => (/^[a-z0-9-]+$/.test(props.badge) ? props.badge : 'developer'),
  // Insígnia: depois do hover a animação continua, não volta a ficar parada
  () => ({ animated: props.animated, locked: props.locked, noHover: props.noHover, keepAfterHover: true }),
)
</script>
