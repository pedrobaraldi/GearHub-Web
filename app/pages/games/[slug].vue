<template>
  <div v-if="game">
    <FormHeader wide eyebrow="Configurações de jogo" :title="game.name" :subtitle="game.genre ?? ''" />

    <form class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-4" novalidate @submit.prevent="save">
      <section v-for="section in game.sections" :key="section.key" class="glass-card overflow-hidden">
        <button
          type="button"
          class="w-full flex items-center gap-3 p-5 sm:px-6 text-left"
          :aria-expanded="isOpen(section.key)"
          @click="toggle(section.key)"
        >
          <span class="w-9 h-9 grid place-items-center rounded-xl bg-gear-accent/10 text-gear-accent shrink-0">
            <AppIcon :name="SECTION_ICONS[section.key] ?? 'settings'" class="w-[18px] h-[18px]" />
          </span>
          <span class="flex-1 min-w-0">
            <span class="block font-semibold leading-tight">{{ section.label }}</span>
            <span class="block text-xs text-gear-muted mt-0.5">{{ filledIn(section) }} de {{ section.fields.length }} preenchidos</span>
          </span>
          <AppIcon name="chevron-down" class="w-4 h-4 text-gear-muted transition-transform duration-200" :class="{ 'rotate-180': isOpen(section.key) }" />
        </button>

        <div v-show="isOpen(section.key)" class="grid grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-4 items-end px-5 sm:px-6 pb-6">
          <GearPicker
            v-if="slotOf(section.key)"
            v-model="gear[slotOf(section.key)!.slug]"
            class="col-span-2"
            :category="slotOf(section.key)!.slug"
            :label="slotOf(section.key)!.name"
            :error="fields[`gear.${slotOf(section.key)!.slug}`]"
          />
          <template v-for="field in section.fields" :key="field.key">
            <div v-if="field.kind === 'computed'">
              <span class="block text-sm font-medium mb-1.5">{{ field.label }}</span>
              <p class="field-input !bg-transparent font-mono tabular-nums">{{ edpi ?? '—' }}</p>
            </div>
            <ChoiceField
              v-else-if="field.kind === 'choice'"
              :id="`field-${field.key}`"
              v-model="settings[field.key]"
              :label="field.label"
              :options="field.options"
              :error="fields[`settings.${field.key}`]"
            />
            <FormField
              v-else
              :id="`field-${field.key}`"
              v-model="settings[field.key]"
              :label="field.label"
              :inputmode="field.kind === 'number' ? 'decimal' : undefined"
              :options="field.options"
              :suffix="field.unit ?? undefined"
              :error="fields[`settings.${field.key}`]"
            />
          </template>
        </div>
      </section>

      <FormSection v-if="otherSlots.length" title="Equipamentos" icon="package" subtitle="Opcional. Quem vê seu perfil pode abrir a review escolhida.">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GearPicker
            v-for="slot in otherSlots"
            :key="slot.slug"
            v-model="gear[slot.slug]"
            :category="slot.slug"
            :label="slot.name"
            :error="fields[`gear.${slot.slug}`]"
          />
        </div>
      </FormSection>

      <div class="form-actions">
        <NuxtLink to="/games" class="btn-cancel inline-flex items-center">Cancelar</NuxtLink>
        <button type="submit" class="btn-publish" :disabled="saving" :class="{ 'opacity-60': saving }">
          <AppIcon name="check" class="w-4 h-4" />
          {{ saving ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { GearChoice } from '~/components/GearPicker.vue'
import type { GameConfig } from '~/components/GameConfigView.vue'
import { toApiFailure } from '~/composables/useAuth'

interface GameField {
  key: string
  label: string
  kind: 'number' | 'text' | 'choice' | 'computed'
  unit: string | null
  options: string[]
}

interface GameDefinition {
  slug: string
  name: string
  genre: string | null
  sections: { key: string, label: string, fields: GameField[] }[]
  gearSlots: { slug: string, name: string }[]
}

definePageMeta({ middleware: 'auth' })

const slug = useRoute().params.slug as string
const { user } = useAuth()
const toast = useToast()

const { data: game, error: gameError } = await useFetch<GameDefinition>(`/api/v1/games/${slug}`, { key: `game-${slug}` })
if (gameError.value) {
  throw createError({ statusCode: 404, statusMessage: 'Jogo não encontrado', fatal: true })
}

useHead({ title: () => `${game.value?.name} · GearHub` })

const { data: configs } = await useFetch<GameConfig[]>(() => `/api/v1/users/${user.value?.username}/games`, { key: `my-games-${slug}` })

const current = computed(() => configs.value?.find(config => config.slug === slug))

const settings = ref<Record<string, string>>({ ...current.value?.settings })
const gear = ref<Record<string, GearChoice | null>>(
  Object.fromEntries((current.value?.gear ?? []).map(item => [item.category, item])),
)
const fields = ref<Record<string, string>>({})
const saving = ref(false)
const openSections = ref(new Set([game.value?.sections[0]?.key]))

// Cada equipamento fica na seção correspondente; o que não tem seção vai para Equipamentos
const slotOf = (section: string) => game.value?.gearSlots.find(slot => slot.slug === SECTION_GEAR[section])

const otherSlots = computed(() => {
  const placed = game.value?.sections.map(section => SECTION_GEAR[section.key]) ?? []
  return game.value?.gearSlots.filter(slot => !placed.includes(slot.slug)) ?? []
})

const isOpen = (key: string) => openSections.value.has(key)

function toggle(key: string) {
  if (!openSections.value.delete(key)) openSections.value.add(key)
}

const filledIn = (section: GameDefinition['sections'][number]) =>
  section.fields.filter(field => (field.kind === 'computed' ? edpi.value : settings.value[field.key]?.trim())).length

const toNumber = (text?: string) => Number((text ?? '').trim().replace(',', '.'))

const edpi = computed(() => {
  const { dpi, sensitivity } = settings.value
  const value = toNumber(dpi) * toNumber(sensitivity)
  return dpi && sensitivity && Number.isFinite(value) ? Number(value.toFixed(2)).toString() : null
})

async function save() {
  fields.value = {}
  saving.value = true
  try {
    await $fetch(`/api/v1/me/games/${slug}`, {
      method: 'PUT',
      body: {
        settings: settings.value,
        gear: Object.fromEntries(Object.entries(gear.value)
          .filter(([, choice]) => choice)
          .map(([category, choice]) => [category, { productId: choice!.productId, reviewId: choice!.reviewId }])),
      },
    })
    toast.success('Configurações salvas.')
    await navigateTo('/games')
  }
  catch (error) {
    const failure = toApiFailure(error)
    fields.value = failure.fields
    toast.failure(failure)
    // Um erro pode estar em uma seção fechada
    for (const section of game.value?.sections ?? []) {
      if (section.fields.some(field => fields.value[`settings.${field.key}`]) || fields.value[`gear.${SECTION_GEAR[section.key]}`]) {
        openSections.value.add(section.key)
      }
    }
  }
  finally {
    saving.value = false
  }
}
</script>
