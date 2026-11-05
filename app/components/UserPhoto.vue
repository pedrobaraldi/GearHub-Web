<template>
  <img v-if="src" :src="src" :alt="name" class="rounded-full object-cover bg-gear-bg" />
  <span
    v-else
    class="rounded-full bg-gear-primary text-gear-on-primary grid place-items-center font-bold uppercase select-none"
    aria-hidden="true"
  >{{ name.charAt(0) }}</span>
</template>

<script setup lang="ts">
defineProps<{ src?: string | null, name: string }>()
</script>
