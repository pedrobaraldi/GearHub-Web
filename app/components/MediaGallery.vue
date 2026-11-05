<template>
  <div
    class="grid gap-0.5 bg-gear-surface overflow-hidden"
    :class="images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'"
  >
    <div
      v-for="(url, index) in images"
      :key="url"
      class="overflow-hidden"
      :class="[images.length === 1 || (images.length === 3 && index === 0) ? 'aspect-video' : 'aspect-[4/3]', { 'col-span-2': images.length === 3 && index === 0 }]"
    >
      <img
        :src="url"
        :alt="images.length > 1 ? `${alt}, imagem ${index + 1}` : alt"
        loading="lazy"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ images: string[], alt: string }>()
</script>
