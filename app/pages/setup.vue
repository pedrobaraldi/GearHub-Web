<template>
  <div ref="root">
    <FormHeader eyebrow="Meu setup" title="Configure seu setup" subtitle="Cadastre seus periféricos e hardware. Aparece no seu perfil." />

    <form class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-4" novalidate @submit.prevent="save">
      <div data-step class="glass-card p-4 sm:px-6">
        <div class="flex items-center justify-between text-xs text-gear-muted mb-2">
          <span>Setup preenchido</span>
          <span class="font-mono tabular-nums">{{ filled }}/{{ slots.length }}</span>
        </div>
        <div class="h-1 rounded-full bg-gear-surface overflow-hidden">
          <div class="h-full rounded-full neon-bar transition-[width] duration-300" :style="{ width: `${slots.length ? (filled / slots.length) * 100 : 0}%` }" />
        </div>
      </div>

      <div v-for="section in SECTIONS" :key="section.key" data-step>
        <FormSection :title="section.label" :icon="section.icon" :subtitle="section.subtitle">
          <div class="grid sm:grid-cols-2 gap-4">
            <FormField
              v-for="slot in slots.filter(item => item.section === section.key)"
              :id="`setup-${slot.key}`"
              :key="slot.key"
              v-model="values[slot.key]"
              :label="slot.label"
              :options="suggestionsFor(slot.label)"
              placeholder="Digite ou escolha da lista"
              :error="fields[slot.key]"
            />
          </div>
        </FormSection>
      </div>

      <div data-step>
        <FormSection title="Fotos do setup" icon="image-plus" subtitle="Até 12 fotos, JPG, PNG ou WebP, com 2 MB cada. Aparecem no seu perfil.">
          <template #aside>
            <span class="text-xs font-mono tabular-nums text-gear-muted shrink-0">{{ photos.length }}/{{ MAX_PHOTOS }}</span>
          </template>
          <ImageListField v-model="photos" :max="MAX_PHOTOS" />
          <p v-if="fields.photos" class="text-xs text-gear-red mt-1.5">{{ fields.photos }}</p>
        </FormSection>
      </div>

      <div data-step class="form-actions !justify-between">
        <NuxtLink v-if="user" :to="`/profile/${user.username}`" class="inline-flex items-center min-h-11 lg:min-h-0 text-xs text-gear-muted hover:text-gear-text transition-colors">Ver no perfil</NuxtLink>
        <button type="submit" class="btn-publish" :disabled="saving" :class="{ 'opacity-60': saving }">
          <AppIcon name="check" class="w-4 h-4" />
          {{ saving ? 'Salvando...' : 'Salvar setup' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { toApiFailure } from '~/composables/useAuth'

interface SetupItem {
  key: string
  label: string
  section: string
  value: string | null
}

const MAX_PHOTOS = 12

const SECTIONS = [
  { key: 'perifericos', label: 'Periféricos', icon: 'mouse', subtitle: 'O que você usa no dia a dia.' },
  { key: 'hardware', label: 'Hardware', icon: 'monitor', subtitle: 'As peças do seu computador.' },
]

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Meu setup · GearHub' })

const { user } = useAuth()
const toast = useToast()

const { data } = await useFetch<SetupItem[]>('/api/v1/me/setup', {
  key: 'my-setup',
  headers: useRequestHeaders(['cookie']),
})

const { data: products } = await useFetch<{ name: string, brand: string, category: string }[]>('/api/v1/products', { key: 'form-products' })

// Cada campo do setup é uma categoria do catálogo, com nome diferente em dois casos
const CATEGORY_OF: Record<string, string> = { RAM: 'Memória RAM' }

const suggestionsFor = (label: string) =>
  (products.value ?? [])
    .filter(product => product.category === (CATEGORY_OF[label] ?? label))
    .map(productTitle)

const slots = computed(() => data.value ?? [])
const values = ref<Record<string, string>>(
  Object.fromEntries((data.value ?? []).map(item => [item.key, item.value ?? ''])),
)
const { data: savedPhotos } = await useFetch<string[]>(() => `/api/v1/users/${user.value?.username}/setup/photos`, { key: 'my-setup-photos' })
const photos = ref<string[]>([...(savedPhotos.value ?? [])])
const fields = ref<Record<string, string>>({})
const saving = ref(false)
const filled = computed(() => Object.values(values.value).filter(value => value.trim()).length)

async function save() {
  fields.value = {}
  saving.value = true
  try {
    await $fetch('/api/v1/me/setup', { method: 'PUT', body: values.value })
    await $fetch('/api/v1/me/setup/photos', { method: 'PUT', body: { photos: photos.value } })
    toast.success('Setup salvo.')
  }
  catch (error) {
    const failure = toApiFailure(error)
    fields.value = failure.fields
    toast.failure(failure)
  }
  finally {
    saving.value = false
  }
}

const root = ref<HTMLElement | null>(null)

useGsapContext(root, (el) => {
  gsap.from(el.querySelectorAll('[data-step]'), { autoAlpha: 0, y: 18, duration: 0.45, ease: 'power3.out', stagger: 0.08, clearProps: 'transform' })
})
</script>
