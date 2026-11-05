<template>
  <ClientOnly>
    <button
      type="button"
      :aria-label="isDark ? 'Modo claro' : 'Modo escuro'"
      :title="isDark ? 'Modo claro' : 'Modo escuro'"
      class="flex items-center text-gear-muted hover:text-gear-text transition-colors"
      :class="nav
        ? 'gap-3 w-full h-10 px-[15px] rounded-lg text-sm font-medium overflow-hidden hover:bg-gear-surface/60'
        : 'p-2.5 rounded-lg hover:bg-gear-surface'"
      @click="colorMode.preference = isDark ? 'light' : 'dark'"
    >
      <AppIcon :name="isDark ? 'sun' : 'moon'" class="shrink-0" :class="nav ? 'w-[18px] h-[18px]' : 'w-3.5 h-3.5'" />
      <span
        v-if="nav"
        class="whitespace-nowrap transition-opacity duration-150"
        :class="{ 'opacity-0': compact }"
      >{{ isDark ? 'Modo claro' : 'Modo escuro' }}</span>
    </button>
    <template #fallback>
      <span class="block" :class="nav ? 'h-10' : 'w-9 h-9'" />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
defineProps<{ nav?: boolean; compact?: boolean }>()

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
</script>
