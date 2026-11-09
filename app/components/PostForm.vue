<template>
  <div ref="root">
  <FormShell
    :title="editing ? 'Editar post' : 'Novo post'"
    subtitle="Compartilhe uma discussão, dúvida ou dica."
    preview-label="Como vai aparecer no feed"
  >
    <form novalidate @submit.prevent="submit">
      <div data-step>
        <FormSection title="Sobre o que é?" icon="message-square" :subtitle="selectedTopicName ? `Tópico: ${selectedTopicName}` : 'Escolha um tópico.'">
          <fieldset>
            <legend class="sr-only">Categoria do post</legend>
            <!-- Chips compactos: fechado mostra os primeiros e o escolhido; o resto abre no botão -->
            <div id="post-topics" class="flex flex-wrap gap-2">
              <button
                v-for="option in visibleTopics"
                :key="option.slug"
                type="button"
                class="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border text-xs font-medium transition-colors"
                :class="topic === option.slug ? 'border-gear-primary bg-gear-primary/10 text-gear-primary' : 'border-gear-border text-gear-muted hover:text-gear-text hover:border-gear-text/30'"
                :aria-pressed="topic === option.slug"
                @click="topic = option.slug"
              >
                <TopicIcon :slug="option.slug" class="w-4 h-4" />
                {{ option.name }}
              </button>
              <button
                v-if="hiddenTopicCount"
                type="button"
                class="inline-flex items-center gap-1 h-9 px-3 rounded-full text-xs font-semibold text-gear-accent hover:bg-gear-accent/10 transition-colors"
                :aria-expanded="showAllTopics"
                aria-controls="post-topics"
                @click="showAllTopics = !showAllTopics"
              >
                {{ showAllTopics ? 'Menos tópicos' : `Mais tópicos (${hiddenTopicCount})` }}
                <AppIcon name="chevron-down" class="w-3.5 h-3.5 transition-transform" :class="{ 'rotate-180': showAllTopics }" />
              </button>
            </div>
            <p v-if="fields.topic" class="text-xs text-gear-red mt-1.5">{{ fields.topic }}</p>
          </fieldset>
        </FormSection>
      </div>

      <div data-step class="form-section">
        <label for="post-body" class="flex items-center gap-3 mb-4">
          <span class="w-8 h-8 grid place-items-center rounded-lg bg-gear-accent/10 text-gear-accent shrink-0"><AppIcon name="file-text" class="w-4 h-4" /></span>
          <span class="font-semibold">Texto</span>
        </label>
      <div class="rounded-2xl border bg-gear-surface overflow-hidden transition-colors" :class="fields.body ? 'border-gear-red' : 'border-gear-border focus-within:border-gear-accent'">
        <textarea
          id="post-body"
          v-model="form.body"
          rows="7"
          aria-label="Texto do post"
          placeholder="O que está pensando? Use #hashtags livremente."
          class="w-full bg-transparent px-5 pt-5 pb-2 text-base sm:text-sm text-gear-text placeholder-gear-muted resize-none outline-none"
        />
        <ImageListField v-model="images" compact>
          <span class="text-xs tabular-nums" :class="remaining < 0 ? 'text-gear-red' : 'text-gear-muted'">{{ remaining }}</span>
        </ImageListField>
      </div>
      <p v-if="fields.body || fields.images" class="text-xs text-gear-red mt-1.5">{{ fields.body || fields.images }}</p>
      </div>

      <div data-step>
        <FormSection title="Tags" subtitle="Opcional." icon="link">
          <TagInput v-model="tags" :error="tagError" />
        </FormSection>
      </div>

      <div data-step class="form-actions">
        <button type="button" class="btn-cancel" @click="goBack">Cancelar</button>
        <button type="submit" class="btn-publish" :disabled="sending" :class="{ 'opacity-60': sending }">
          {{ editing ? (sending ? 'Salvando...' : 'Salvar') : (sending ? 'Publicando...' : 'Publicar') }}
        </button>
      </div>
    </form>

    <template #preview>
      <PostPreview
        :author="user ? { displayName: user.displayName, avatarUrl: user.avatarUrl } : null"
        :topic-name="topics?.find(option => option.slug === topic)?.name"
        :body="form.body"
        :tags="tags"
        :images="images"
      />
    </template>
  </FormShell>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { toApiFailure } from '~/composables/useAuth'

export interface PostDraft {
  body: string
  topic: string | null
  tags: string[]
  images: string[]
}

const MAX_LENGTH = 1000

const props = defineProps<{ editing?: { id: string, draft: PostDraft } }>()
const rankUp = useRankUp()
const { user } = useAuth()

const toast = useToast()
const goBack = useGoBack()

const { data: topics } = await useFetch<{ slug: string, name: string }[]>('/api/v1/post-topics', { key: 'post-topics' })

// Tópicos que aparecem com a lista fechada; o escolhido sempre aparece, mesmo fora deles
const COLLAPSED_TOPICS = 6
const showAllTopics = ref(false)
const visibleTopics = computed(() => {
  const all = topics.value ?? []
  if (showAllTopics.value) return all
  const first = all.slice(0, COLLAPSED_TOPICS)
  const chosen = all.find(option => option.slug === topic.value)
  return chosen && !first.includes(chosen) ? [...first, chosen] : first
})
// O botão continua aparecendo aberto, para poder fechar a lista
const hiddenTopicCount = computed(() => Math.max(0, (topics.value?.length ?? 0) - COLLAPSED_TOPICS))
const selectedTopicName = computed(() => topics.value?.find(option => option.slug === topic.value)?.name)

const draft = props.editing?.draft
const topic = ref(draft?.topic ?? 'discussao')
const images = ref<string[]>(draft?.images ?? [])
const form = reactive({ body: draft?.body ?? '' })
const tags = ref<string[]>(draft?.tags ?? [])
const fields = ref<Record<string, string>>({})
const sending = ref(false)

const remaining = computed(() => MAX_LENGTH - form.body.length)

// O erro some assim que a pessoa volta a escrever
watch(() => form.body, () => {
  delete fields.value.body
})
// A validação de cada tag chega como tags[0], tags[1]...
const tagError = computed(() =>
  fields.value.tags ?? Object.entries(fields.value).find(([key]) => key.startsWith('tags'))?.[1],
)

async function submit() {
  fields.value = {}
  sending.value = true
  const body = {
    body: form.body,
    topic: topic.value,
    tags: tags.value,
    images: images.value,
  }
  try {
    if (props.editing) await $fetch(`/api/v1/posts/${props.editing.id}`, { method: 'PATCH', body })
    else await $fetch('/api/v1/posts', { method: 'POST', body })
    // Publicar dá XP: confere na hora se a pessoa subiu de patente
    rankUp.check(true)
    clearNuxtData('feed')
    await navigateTo('/', { replace: true })
  }
  catch (error) {
    const failure = toApiFailure(error)
    fields.value = failure.fields
    toast.failure(failure)
  }
  finally {
    sending.value = false
  }
}

const root = ref<HTMLElement | null>(null)

useGsapContext(root, (el) => {
  gsap.from(el.querySelectorAll('[data-step]'), { autoAlpha: 0, y: 18, duration: 0.45, ease: 'power3.out', stagger: 0.07, clearProps: 'transform' })
})
</script>
