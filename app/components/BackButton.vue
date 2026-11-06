<template>
  <button
    type="button"
    class="btn-outline max-sm:!p-0 max-sm:w-11"
    aria-label="Voltar"
    @click="goBack"
  >
    <AppIcon name="arrow-left" class="w-4 h-4" />
    <span class="max-sm:hidden">Voltar</span>
  </button>
</template>

<script setup lang="ts">
const goBack = useGoBack()
</script>
