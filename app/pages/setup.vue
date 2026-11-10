<template>
  <div ref="root">
  <FormShell title="Meu setup" subtitle="Cadastre seus periféricos e hardware. Aparece no seu perfil." preview-label="Como aparece no seu perfil">
    <form novalidate @submit.prevent="save">
      <div data-step class="pb-6">
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

    <template #preview>
      <div class="space-y-3">
        <section v-for="section in previewSections" :key="section.label" class="glass-card p-4">
          <h3 class="text-xs font-semibold text-gear-text-secondary mb-2">{{ section.label }}</h3>
          <dl v-if="section.items.length" class="divide-y divide-gear-border">
            <div v-for="item in section.items" :key="item.key" class="grid grid-cols-[88px_1fr] gap-3 py-2">
              <dt class="text-xs text-gear-muted self-center">{{ item.label }}</dt>
              <dd class="text-sm font-medium break-words">{{ item.value }}</dd>
            </div>
          </dl>
          <p v-else class="text-xs text-gear-muted italic">Nada preenchido ainda.</p>
        </section>
        <div v-if="photos.length" class="grid grid-cols-3 gap-1.5">
          <img v-for="(photo, index) in photos.slice(0, 6)" :key="photo" :src="photo" :alt="`Foto ${index + 1} do setup`" class="aspect-[4/3] w-full rounded-lg object-cover" />
        </div>
      </div>
    </template>
  </FormShell>
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

// Prévia: só o que já foi preenchido, separado como no perfil
const previewSections = computed(() =>
  SECTIONS.map(section => ({
    label: section.label,
    items: slots.value
      .filter(slot => slot.section === section.key && values.value[slot.key]?.trim())
      .map(slot => ({ key: slot.key, label: slot.label, value: values.value[slot.key]! })),
  })),
)

async function save() {
  fields.value = {}
  saving.value = true
  try {
    await $fetch('/api/v1/me/setup', { method: 'PUT', body: values.value })
    await $fetch('/api/v1/me/setup/photos', { method: 'PUT', body: { photos: photos.value } })
    toast.success('Setup salvo.')
    if (user.value) await navigateTo({ path: `/profile/${user.value.username}`, query: { aba: 'setup' } }, { replace: true })
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
