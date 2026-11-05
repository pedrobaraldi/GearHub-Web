<template>
  <div v-if="draft">
    <ReviewForm v-if="kind === 'review'" :editing="{ id, draft: draft as ReviewDraft }" />
    <PostForm v-else :editing="{ id, draft: draft as PostDraft }" />
  </div>
</template>

<script setup lang="ts">
import type { PostDraft } from '~/components/PostForm.vue'
import type { ReviewDraft } from '~/components/ReviewForm.vue'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Editar publicação · GearHub' })

const route = useRoute()
const kind = route.params.kind as string
const id = route.params.id as string

if (kind !== 'post' && kind !== 'review') {
  throw createError({ statusCode: 404, statusMessage: 'Publicação não encontrada', fatal: true })
}

// Sem cache: o formulário sempre abre com a versão salva
const { data: draft, error } = await useFetch<PostDraft | ReviewDraft>(`/api/v1/${kind === 'post' ? 'posts' : 'reviews'}/${id}/edit`, {
  key: `draft-${id}-${Date.now()}`,
  headers: useRequestHeaders(['cookie']),
})

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode ?? 404,
    statusMessage: error.value.data?.detail ?? 'Publicação não encontrada',
    fatal: true,
  })
}
</script>
