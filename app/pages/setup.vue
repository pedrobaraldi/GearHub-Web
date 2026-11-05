<template>
  <div ref="root">
    <FormHeader eyebrow="Meu setup" title="Configure seu setup" subtitle="Cadastre seus periféricos e hardware. Aparece no seu perfil." />

    <form class="max-w-2xl px-4 sm:px-6 lg:px-10 py-6 space-y-6" novalidate @submit.prevent="save">
      <section v-for="section in SECTIONS" :key="section.key" data-step class="glass-card p-5 sm:p-6">
        <h2 class="editorial-eyebrow mb-4">{{ section.label }}</h2>
        <div class="grid sm:grid-cols-2 gap-4">
          <FormField
            v-for="slot in slots.filter(item => item.section === section.key)"
            :id="`setup-${slot.key}`"
            :key="slot.key"
            v-model="values[slot.key]"
            :label="slot.label"
            eyebrow
            :placeholder="`Seu ${slot.label.toLowerCase()}`"
            :error="fields[slot.key]"
          />
        </div>
      </section>

      <div data-step class="flex items-center justify-between gap-4">
        <button type="submit" class="btn-publish" :disabled="saving" :class="{ 'opacity-60': saving }">
          <AppIcon name="check" class="w-4 h-4" />
          {{ saving ? 'Salvando...' : 'Salvar setup' }}
        </button>
        <NuxtLink v-if="user" :to="`/profile/${user.username}`" class="text-xs text-gear-muted hover:text-gear-text transition-colors">Visualizar página pública</NuxtLink>
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

const SECTIONS = [
  { key: 'perifericos', label: 'Periféricos' },
  { key: 'hardware', label: 'Hardware' },
]

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Meu setup · GearHub' })

const { user } = useAuth()
const toast = useToast()

const { data } = await useFetch<SetupItem[]>('/api/v1/me/setup', {
  key: 'my-setup',
  headers: useRequestHeaders(['cookie']),
})

const slots = computed(() => data.value ?? [])
const values = ref<Record<string, string>>(
  Object.fromEntries((data.value ?? []).map(item => [item.key, item.value ?? ''])),
)
const fields = ref<Record<string, string>>({})
const saving = ref(false)

async function save() {
  fields.value = {}
  saving.value = true
  try {
    await $fetch('/api/v1/me/setup', { method: 'PUT', body: values.value })
    toast.success('Setup salvo.')
  }
  catch (error) {
    const failure = toApiFailure(error)
    fields.value = failure.fields
    toast.error(failure.message)
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
