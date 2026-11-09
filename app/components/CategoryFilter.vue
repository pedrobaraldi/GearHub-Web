<template>
  <div class="relative">
    <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        v-for="cat in categories"
        :key="cat"
        class="pill"
        :class="modelValue === cat ? 'pill-active' : 'pill-idle'"
        :aria-pressed="modelValue === cat"
        @click="$emit('update:modelValue', cat)"
      >
        {{ cat }}
      </button>
    </div>
    <!-- Fade right -->
    <div class="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-gear-bg to-transparent pointer-events-none" />
  </div>
</template>

<script setup lang="ts">
import type { Category } from '~/composables/useGearData'

defineProps<{ modelValue: Category }>()
defineEmits<{ 'update:modelValue': [v: Category] }>()

const { categories: available } = await useCatalog()
const categories = computed(() => ['Todos', ...available.value.map(category => category.name)])
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
