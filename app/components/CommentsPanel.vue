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
      <li v-for="thread in threads" :key="thread.comment.id">
        <CommentEntry :comment="thread.comment" @like="toggleLike(thread.comment)" @reply="startReply(thread.comment, thread.comment.id)" @remove="removeComment(thread.comment)" />

        <ul v-if="thread.replies.length" class="mt-3 ml-4 pl-3 border-l border-gear-border space-y-3">
          <li v-for="reply in thread.replies" :key="reply.id">
            <CommentEntry reply :comment="reply" @like="toggleLike(reply)" @reply="startReply(reply, thread.comment.id)" @remove="removeComment(reply)" />
          </li>
        </ul>

        <form v-if="replying?.threadId === thread.comment.id" class="mt-3 ml-4 pl-3 border-l border-gear-border" novalidate @submit.prevent="sendReply">
          <textarea
            ref="replyInput"
            v-model="replyText"
            rows="2"
            :aria-label="`Responder a ${replying.name}`"
            :placeholder="`Responder a ${replying.name}`"
            class="field-input"
          />
          <div class="flex items-center gap-3 mt-2">
            <button type="submit" class="btn-primary !py-1.5" :disabled="sending" :class="{ 'opacity-60': sending }">Responder</button>
            <button type="button" class="btn-cancel" @click="replying = null">Cancelar</button>
          </div>
        </form>
      </li>
    </ul>
    <p v-if="!loading && !comments.length" class="text-xs text-gear-muted">Nenhum comentário ainda.</p>
  </section>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { toApiFailure } from '~/composables/useAuth'
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
const replying = ref<{ id: string, threadId: string, name: string } | null>(null)
const replyText = ref('')
const replyInput = ref<HTMLTextAreaElement | HTMLTextAreaElement[] | null>(null)

const threads = computed(() =>
  comments.value
    .filter(comment => !comment.parentId)
    .map(comment => ({ comment, replies: comments.value.filter(item => item.parentId === comment.id) })),
)

async function startReply(comment: CommentItem, threadId: string) {
  if (!ensureUser()) return
  replying.value = { id: comment.id, threadId, name: comment.author.displayName }
  replyText.value = ''
  await nextTick()
  const input = replyInput.value
  ;(Array.isArray(input) ? input[0] : input)?.focus()
}

async function sendReply() {
  if (!replying.value) return
  sending.value = true
  try {
    await addComment(props.kind, props.id, replyText.value, replying.value.id)
    replying.value = null
    replyText.value = ''
    emit('changed', 1)
    await reload()
  }
  catch (failure) {
    toast.failure(toApiFailure(failure))
  }
  finally {
    sending.value = false
  }
}

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
    // As respostas somem junto com o comentário
    const removed = comments.value.filter(item => item.id === comment.id || item.parentId === comment.id)
    comments.value = comments.value.filter(item => !removed.includes(item))
    emit('changed', -removed.length)
  }
}
</script>
