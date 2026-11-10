<template>
  <!-- Prévia da review: produto, nota média, análise, prós e contras -->
  <article class="space-y-3">
    <div v-if="author" class="flex items-center gap-2.5">
      <UserPhoto :src="author.avatarUrl" :name="author.displayName" class="w-9 h-9 text-xs shrink-0" />
      <div class="min-w-0">
        <p class="text-sm font-semibold truncate">{{ author.displayName }}</p>
        <p class="text-xs text-gear-muted truncate">agora<template v-if="categoryName"> · {{ categoryName }}</template></p>
      </div>
    </div>

    <div class="glass-card overflow-hidden">
      <MediaGallery v-if="images?.length" :images="images" alt="Imagem da review" />
      <div class="p-5">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-xs text-gear-muted">Produto</p>
            <p class="text-sm font-semibold truncate">{{ productName || 'Escolha o produto' }}</p>
          </div>
          <span class="font-display italic font-extrabold text-4xl leading-none tabular-nums" :class="average ? 'text-gear-primary' : 'text-gear-muted'">{{ average ?? '—' }}</span>
        </div>

        <h3 class="text-lg font-semibold tracking-tight leading-snug mt-4" :class="{ 'text-gear-muted italic font-normal text-sm': !title.trim() }">
          {{ title.trim() || 'O título da review aparece aqui.' }}
        </h3>
        <p v-if="body.trim()" class="text-sm text-gear-text-secondary leading-relaxed whitespace-pre-line break-words mt-2 line-clamp-5">{{ body }}</p>

        <div v-if="pros.length || cons.length" class="grid grid-cols-2 gap-3 mt-4 text-xs">
          <ul aria-label="Prós" class="space-y-1">
            <li v-for="item in pros" :key="item" class="flex gap-1.5"><AppIcon name="check" class="w-3.5 h-3.5 text-gear-green shrink-0 mt-px" />{{ item }}</li>
          </ul>
          <ul aria-label="Contras" class="space-y-1">
            <li v-for="item in cons" :key="item" class="flex gap-1.5"><AppIcon name="x" class="w-3.5 h-3.5 text-gear-red shrink-0 mt-px" />{{ item }}</li>
          </ul>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  author: { displayName: string, avatarUrl: string | null } | null
  productName?: string
  categoryName?: string
  title: string
  body: string
  average: string | null
  pros: string[]
  cons: string[]
  images?: string[]
}>()
</script>
