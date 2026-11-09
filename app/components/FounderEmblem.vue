<template>
  <!-- Emblema do Fundador com o número da pessoa na plaquinha, no lugar do "100" do arquivo -->
  <span class="relative inline-block [container-type:inline-size]">
    <BadgeEmblem badge="founder" :title="title" :animated="animated" no-hover class="block w-full h-full" />
    <span
      v-if="number"
      class="founder-plate absolute grid place-items-center font-bold text-white tabular-nums leading-none pointer-events-none"
      :class="{ 'founder-plate--late': animated }"
      aria-hidden="true"
    >#{{ number }}</span>
  </span>
</template>

<script setup lang="ts">
// Sem hover: a animação de entrada esconde a plaquinha por 2,45s e o número ficaria solto
const props = defineProps<{ number?: number | null, animated?: boolean }>()

const title = computed(() => (props.number ? `Fundador nº ${props.number} de 100` : 'Fundador'))
</script>

<style scoped>
/* A plaquinha do SVG fica em x 104–152 e y 216–232 (de 256): cobre o "100" com o fundo dela */
.founder-plate {
  left: 40.6%;
  top: 84.4%;
  width: 18.8%;
  height: 6.3%;
  background: #120e22;
  font-family: 'Chakra Petch', 'Segoe UI', Arial, sans-serif;
  font-size: 5cqw;
  letter-spacing: 0.04em;
}

/* Na versão animada a plaquinha entra aos 2,45s: o número entra junto */
.founder-plate--late {
  animation: founder-plate-in 0.6s cubic-bezier(0.2, 0.8, 0.3, 1) 2.45s both;
}

@keyframes founder-plate-in {
  from { opacity: 0; transform: translateY(12%); }
  to { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .founder-plate--late { animation: none; }
}
</style>
