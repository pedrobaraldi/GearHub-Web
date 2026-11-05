<template>
  <section ref="root" class="mt-4 space-y-4" aria-label="Comentários">
    <form v-if="user" class="flex items-start gap-3" novalidate @submit.prevent="send">
      <UserPhoto :src="user.avatarUrl" :name="user.displayName" class="w-8 h-8 text-xs shrink-0" />
      <div class="flex-1 min-w-0">
        <textarea
          v-model="text"
          rows="2"
          aria-label="Escreva um comentário"
          placeholder="Escreva um comentário"
          class="field-input"
          :class="{ 'field-error': error }"
        />
        <p v-if="error" class="text-xs text-gear-red mt-1">{{ error }}</p>
        <button type="submit" class="btn-primary mt-2 !py-1.5" :disabled="sending" :class="{ 'opacity-60': sending }">Comentar</button>
      </div>
    </form>
    <p v-else class="text-sm text-gear-muted">
      <NuxtLink :to="{ path: '/auth', query: { redirect: route.fullPath } }" class="font-semibold text-gear-primary hover:underline underline-offset-2">Entre</NuxtLink>
      para comentar.
    </p>

    <p v-if="loading" class="text-xs text-gear-muted">Carregando comentários...</p>
    <ul v-else class="space-y-4">
      <li v-for="comment in comments" :key="comment.id" class="flex items-start gap-3">
        <UserPhoto :src="comment.author.avatarUrl" :name="comment.author.displayName" class="w-8 h-8 text-xs shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="text-xs text-gear-muted">
            <NuxtLink :to="`/profile/${comment.author.username}`" class="text-sm font-semibold text-gear-text hover:underline underline-offset-2">{{ comment.author.displayName }}</NuxtLink>
            · {{ formatDate(comment.createdAt) }}
          </p>
          <p class="text-sm text-gear-text-secondary whitespace-pre-line break-words mt-0.5">{{ comment.body }}</p>
          <div class="flex items-center gap-3 mt-1 text-xs font-medium text-gear-muted">
            <button class="transition-colors" :class="comment.likedByMe ? 'text-gear-accent' : 'hover:text-gear-text'" :aria-pressed="comment.likedByMe" @click="toggleLike(comment)">
              Curtir ({{ comment.likeCount }})
            </button>
            <button v-if="comment.mine" class="hover:text-gear-red transition-colors" @click="removeComment(comment)">Apagar</button>
          </div>
        </div>
      </li>
    </ul>
    <p v-if="!loading && !comments.length" class="text-xs text-gear-muted">Nenhum comentário ainda.</p>
  </section>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { toApiFailure } from '~/composables/useAuth'
import { formatDate } from '~/composables/useGearData'
import type { CommentItem, ContentKind } from '~/composables/useInteractions'

const props = defineProps<{ kind: ContentKind, id: string }>()
const emit = defineEmits<{ changed: [delta: number] }>()

const { user } = useAuth()
const route = useRoute()
const toast = useToast()
const { ensureUser, loadComments, addComment, deleteComment, setCommentLike } = useInteractions()

const comments = ref<CommentItem[]>([])
const loading = ref(true)
const text = ref('')
const error = ref('')
const sending = ref(false)
const root = ref<HTMLElement | null>(null)

useGsapContext(root, (el) => {
  gsap.from(el, { autoAlpha: 0, y: -8, duration: 0.3, ease: 'power2.out' })
})

async function reload() {
  comments.value = (await loadComments(props.kind, props.id)) ?? []
  loading.value = false
}

onMounted(reload)

async function send() {
  error.value = ''
  sending.value = true
  try {
    await addComment(props.kind, props.id, text.value)
    text.value = ''
    emit('changed', 1)
    await reload()
  }
  catch (failure) {
    const { message, fields } = toApiFailure(failure)
    error.value = fields.body ?? ''
    toast.error(message)
  }
  finally {
    sending.value = false
  }
}

async function toggleLike(comment: CommentItem) {
  if (!ensureUser()) return
  const result = await setCommentLike(comment.id, !comment.likedByMe)
  if (result) {
    comment.likedByMe = result.liked
    comment.likeCount = result.likeCount
  }
}

async function removeComment(comment: CommentItem) {
  if (await deleteComment(comment.id)) {
    comments.value = comments.value.filter(item => item.id !== comment.id)
    emit('changed', -1)
  }
}
</script>
