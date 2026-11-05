<template>
  <button
    type="button"
    class="btn-outline"
    @click="goBack"
  >
    <AppIcon name="arrow-left" class="w-4 h-4" />
    Voltar
  </button>
</template>

<script setup lang="ts">
const goBack = useGoBack()
</script>
