<template>
  <div ref="root">
    <FormHeader
      eyebrow="Comunidade"
      :title="editing ? 'Editar post' : 'Novo post'"
      subtitle="Compartilhe uma discussão, dúvida ou dica."
    />

    <form class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-4" novalidate @submit.prevent="submit">
      <div data-step>
        <FormSection title="Sobre o que é?" icon="message-square">
          <fieldset>
            <legend class="sr-only">Categoria do post</legend>
            <div class="grid grid-cols-3 sm:grid-cols-5 gap-2">
              <button
                v-for="option in topics"
                :key="option.slug"
                type="button"
                class="flex flex-col items-center justify-center gap-1.5 min-h-[72px] px-1 py-2 rounded-xl border text-xs font-medium text-center transition-colors"
                :class="topic === option.slug ? 'border-gear-primary bg-gear-primary/10 text-gear-primary' : 'border-gear-border text-gear-muted hover:text-gear-text hover:border-gear-text/30'"
                :aria-pressed="topic === option.slug"
                @click="topic = option.slug"
              >
                <TopicIcon :slug="option.slug" class="w-5 h-5" />
                {{ option.name }}
              </button>
            </div>
            <p v-if="fields.topic" class="text-xs text-gear-red mt-1.5">{{ fields.topic }}</p>
          </fieldset>
        </FormSection>
      </div>

      <div data-step class="glass-card overflow-hidden transition-colors" :class="fields.body ? '!border-gear-red' : 'focus-within:!border-gear-accent'">
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
      <p v-if="fields.body || fields.images" class="text-xs text-gear-red">{{ fields.body || fields.images }}</p>

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

const toast = useToast()
const goBack = useGoBack()

const { data: topics } = await useFetch<{ slug: string, name: string }[]>('/api/v1/post-topics', { key: 'post-topics' })

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
    await navigateTo('/')
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
