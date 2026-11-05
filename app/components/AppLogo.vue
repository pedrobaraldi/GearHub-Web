<template>
  <NuxtLink to="/" aria-label="GearHub" class="flex items-center group">
    <img
      src="/logos/logo-light-bg.png"
      alt="GearHub"
      draggable="false"
      class="w-auto max-w-none shrink-0 transition-transform group-hover:scale-[1.03] dark:hidden"
      :class="heightClass"
    />
    <img
      src="/logos/logo-dark-bg.png"
      alt="GearHub"
      draggable="false"
      class="hidden w-auto max-w-none shrink-0 transition-transform group-hover:scale-[1.03] dark:block"
      :class="heightClass"
    />
  </NuxtLink>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ heightClass?: string }>(), { heightClass: 'h-7' })
</script>
