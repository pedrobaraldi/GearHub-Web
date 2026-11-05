<template>
  <div ref="root">
    <FormHeader
      eyebrow="Comunidade"
      :title="editing ? 'Editar post' : 'Novo post'"
      subtitle="Compartilhe uma discussão, dúvida ou dica."
    />

    <form class="max-w-2xl px-4 sm:px-6 lg:px-10 py-6 space-y-6" novalidate @submit.prevent="submit">
      <fieldset data-step>
        <legend class="form-label">Categoria</legend>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in topics"
            :key="option.slug"
            type="button"
            class="pill"
            :class="topic === option.slug ? 'pill-active' : 'pill-idle'"
            :aria-pressed="topic === option.slug"
            @click="topic = option.slug"
          >
            <span aria-hidden="true">{{ option.emoji }}</span> {{ option.name }}
          </button>
        </div>
        <p v-if="fields.topic" class="text-xs text-gear-red mt-1.5">{{ fields.topic }}</p>
      </fieldset>

      <div data-step class="rounded-2xl bg-gear-surface border transition-colors" :class="fields.body ? 'border-gear-red' : 'border-gear-border focus-within:border-gear-accent'">
        <textarea
          id="post-body"
          v-model="form.body"
          rows="7"
          aria-label="Texto do post"
          placeholder="O que está pensando? Use #hashtags livremente."
          class="w-full bg-transparent px-4 pt-4 pb-2 text-base sm:text-sm text-gear-text placeholder-gear-muted resize-none outline-none"
        />
        <ImageListField v-model="images" compact>
          <span class="text-xs tabular-nums" :class="remaining < 0 ? 'text-gear-red' : 'text-gear-muted'">{{ remaining }}</span>
        </ImageListField>
      </div>
      <p v-if="fields.body || fields.images" class="text-xs text-gear-red -mt-4">{{ fields.body || fields.images }}</p>

      <div data-step>
        <FormField
          id="tags"
          v-model="form.tags"
          label="Tags (opcional)"
          eyebrow
          placeholder="valorant, superlight2, setup"
          hint="Hashtags no texto também são detectadas automaticamente."
          :error="tagError"
        />
      </div>

      <div data-step class="flex items-center justify-end gap-4">
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

const toast = useToast()
const goBack = useGoBack()

const { data: topics } = await useFetch<{ slug: string, name: string, emoji: string }[]>('/api/v1/post-topics', { key: 'post-topics' })

const draft = props.editing?.draft
const topic = ref(draft?.topic ?? 'discussao')
const images = ref<string[]>(draft?.images ?? [])
const form = reactive({ body: draft?.body ?? '', tags: draft?.tags.join(', ') ?? '' })
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
    tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    images: images.value,
  }
  try {
    if (props.editing) await $fetch(`/api/v1/posts/${props.editing.id}`, { method: 'PATCH', body })
    else await $fetch('/api/v1/posts', { method: 'POST', body })
    clearNuxtData('feed')
    await navigateTo('/')
  }
  catch (error) {
    const failure = toApiFailure(error)
    fields.value = failure.fields
    toast.error(failure.message)
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
