<template>
  <div class="relative z-10">
    <div class="flex items-center gap-4 pt-4 border-t border-gear-border text-gear-muted">
      <button
        ref="likeButton"
        class="flex items-center gap-1.5 transition-colors duration-200"
        :class="liked ? 'text-gear-accent' : 'hover:text-gear-text'"
        :aria-pressed="liked"
        aria-label="Curtir"
        @click="toggleLike"
      >
        <svg class="w-4 h-4" :fill="liked ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span class="text-xs font-medium tabular-nums">{{ likes }}</span>
      </button>

      <button
        class="flex items-center gap-1.5 hover:text-gear-text transition-colors duration-200"
        :class="{ 'text-gear-text': open }"
        :aria-expanded="open"
        aria-label="Comentários"
        @click="open = !open"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span class="text-xs font-medium tabular-nums">{{ comments }}</span>
      </button>

      <template v-if="mine">
        <NuxtLink :to="`/edit/${kind}/${id}`" class="hover:text-gear-text transition-colors" aria-label="Editar" title="Editar">
          <AppIcon name="pencil" class="w-4 h-4" />
        </NuxtLink>
        <button class="hover:text-gear-red transition-colors" aria-label="Apagar" title="Apagar" @click="confirming = true">
          <AppIcon name="trash" class="w-4 h-4" />
        </button>
      </template>

      <span class="ml-auto text-xs font-medium" aria-live="polite">{{ copied ? 'Link copiado' : '' }}</span>

      <button
        class="transition-colors duration-200"
        :class="saved ? 'text-gear-accent' : 'hover:text-gear-text'"
        :aria-pressed="saved"
        :aria-label="saved ? 'Remover dos salvos' : 'Salvar'"
        :title="saved ? 'Salvo' : 'Salvar'"
        @click="toggleSave"
      >
        <AppIcon name="bookmark" class="w-4 h-4" :class="{ 'fill-current': saved }" />
      </button>

      <button class="hover:text-gear-text transition-colors duration-200" aria-label="Compartilhar" title="Compartilhar" @click="share">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>
    </div>

    <CommentsPanel v-if="open" :kind="kind" :id="id" @changed="comments += $event" />

    <Teleport to="body">
      <div v-if="confirming" class="fixed inset-0 z-[65] grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirmar-titulo">
        <div class="absolute inset-0 bg-black/60" @click="confirming = false" />
        <div class="relative glass-card p-6 w-full max-w-sm">
          <h2 id="confirmar-titulo" class="text-lg font-semibold mb-1">Apagar publicação?</h2>
          <p class="text-sm text-gear-muted mb-5">Essa ação não pode ser desfeita.</p>
          <div class="flex justify-end gap-2">
            <button class="btn-outline" @click="confirming = false">Cancelar</button>
            <button class="px-4 py-2 rounded-lg text-sm font-medium bg-gear-red text-white hover:opacity-90 transition-opacity" :disabled="removing" @click="confirmRemove">Apagar</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import type { ContentKind } from '~/composables/useInteractions'

const props = defineProps<{
  kind: ContentKind
  id: string
  likeCount: number
  commentCount: number
  likedByMe?: boolean
  savedByMe?: boolean
  mine?: boolean
}>()

const emit = defineEmits<{ deleted: [] }>()

const { ensureUser, setLike, setSaved, remove } = useInteractions()
const { copy, copied } = useClipboard({ legacy: true })

const liked = ref(props.likedByMe ?? false)
const likes = ref(props.likeCount)
const saved = ref(props.savedByMe ?? false)
const comments = ref(props.commentCount)
const open = ref(false)
const confirming = ref(false)
const removing = ref(false)
const likeButton = ref<HTMLElement | null>(null)

async function toggleLike() {
  if (!ensureUser()) return
  const next = !liked.value
  const previous = likes.value
  liked.value = next
  likes.value += next ? 1 : -1
  if (next) {
    gsap.fromTo(likeButton.value?.querySelector('svg') ?? null, { scale: 0.6 }, { scale: 1, duration: 0.45, ease: 'back.out(4)' })
  }
  const result = await setLike(props.kind, props.id, next)
  if (result) {
    likes.value = result.likeCount
  }
  else {
    liked.value = !next
    likes.value = previous
  }
}

async function toggleSave() {
  if (!ensureUser()) return
  const next = !saved.value
  saved.value = next
  if ((await setSaved(props.kind, props.id, next)) === null) {
    saved.value = !next
  }
}

async function confirmRemove() {
  removing.value = true
  const done = await remove(props.kind, props.id)
  removing.value = false
  confirming.value = false
  if (done) emit('deleted')
}

async function share() {
  const url = window.location.origin
  if (navigator.share) {
    await navigator.share({ url }).catch(() => {})
  }
  else {
    await copy(url)
  }
}
</script>
