<template>
  <!-- Prévia do post como aparece no feed, montada com o que está no formulário -->
  <article class="space-y-3">
    <div v-if="author" class="flex items-center gap-2.5">
      <UserPhoto :src="author.avatarUrl" :name="author.displayName" class="w-9 h-9 text-xs shrink-0" />
      <div class="min-w-0">
        <p class="text-sm font-semibold truncate">{{ author.displayName }}</p>
        <p class="text-xs text-gear-muted truncate">agora<template v-if="topicName"> · {{ topicName }}</template></p>
      </div>
    </div>

    <div class="glass-card overflow-hidden">
      <div v-if="images.length" class="grid gap-0.5" :class="images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'">
        <img v-for="(image, index) in images.slice(0, 4)" :key="image" :src="image" :alt="`Imagem ${index + 1} do post`" class="w-full aspect-video object-cover" />
      </div>
      <div class="p-5">
        <p v-if="body.trim()" class="text-sm text-gear-text-secondary leading-relaxed whitespace-pre-line break-words line-clamp-[10]">{{ body }}</p>
        <p v-else class="text-sm text-gear-muted italic">O texto do post aparece aqui.</p>
        <ul v-if="tags.length" class="flex flex-wrap gap-x-3 gap-y-1 mt-3" aria-label="Tags">
          <li v-for="tag in tags" :key="tag" class="text-xs font-medium text-gear-accent">#{{ tag }}</li>
        </ul>
        <div class="flex items-center gap-5 mt-5 text-xs text-gear-muted" aria-hidden="true">
          <span class="inline-flex items-center gap-1.5"><AppIcon name="heart" class="w-4 h-4" />0</span>
          <span class="inline-flex items-center gap-1.5"><AppIcon name="message-square" class="w-4 h-4" />0</span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  author: { displayName: string, avatarUrl: string | null } | null
  topicName?: string
  body: string
  tags: string[]
  images: string[]
}>()
</script>
