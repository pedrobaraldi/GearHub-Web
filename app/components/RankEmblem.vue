<template>
  <!-- Emblemas em public/ranks: animado só nas exibições principais; o hover toca a entrada de novo -->
  <img
    :src="src"
    :alt="title ?? rank"
    class="object-contain select-none"
    :class="stateClass"
    draggable="false"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  />
</template>

<script setup lang="ts">
const SLUGS: Record<string, string> = {
  'Cobre': 'cobre',
  'Prata': 'prata',
  'Cobalto': 'cobalto',
  'Esmeralda': 'esmeralda',
  'Platina': 'platina',
  'Diamante': 'diamante',
}

const props = defineProps<{ rank: string, title?: string, animated?: boolean, locked?: boolean, noHover?: boolean }>()

const { src, onEnter, onLeave, stateClass } = useEmblemSource(
  'ranks',
  () => SLUGS[props.rank] ?? 'cobre',
  () => ({ animated: props.animated, locked: props.locked, noHover: props.noHover }),
)
</script>
