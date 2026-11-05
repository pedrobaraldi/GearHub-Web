<template>
  <div>
    <FormHeader eyebrow="Configurações de jogo" title="Seus jogos favoritos" subtitle="Selecione até 3 jogos e cadastre suas configurações para exibir no seu perfil." />

    <div class="max-w-2xl px-4 sm:px-6 lg:px-10 py-6 space-y-5">
      <div class="flex items-center justify-between gap-4">
        <p class="text-sm text-gear-muted">{{ configs.length }}/3 jogos cadastrados</p>
        <button type="button" class="btn-publish" @click="openForm()">
          <AppIcon name="plus" class="w-4 h-4" />
          Adicionar jogo
        </button>
      </div>

      <div v-if="!configs.length" class="glass-card p-10 text-center text-sm text-gear-muted">Nenhum jogo cadastrado ainda.</div>

      <article v-for="config in configs" :key="config.slug" class="glass-card p-5">
        <div class="flex items-center justify-between gap-3 mb-3">
          <h2 class="font-semibold">{{ config.name }}</h2>
          <div class="flex items-center gap-3 text-gear-muted">
            <button type="button" class="hover:text-gear-text transition-colors" :aria-label="`Editar ${config.name}`" @click="openForm(config)">
              <AppIcon name="pencil" class="w-4 h-4" />
            </button>
            <button type="button" class="hover:text-gear-red transition-colors" :aria-label="`Remover ${config.name}`" @click="remove(config)">
              <AppIcon name="trash" class="w-4 h-4" />
            </button>
          </div>
        </div>
        <GameStats :config="config" />
      </article>
    </div>

    <AppModal :open="formOpen" :title="editingSlug ? 'Editar jogo' : 'Adicionar jogo'" width-class="max-w-lg" @close="formOpen = false">
      <form class="space-y-4" novalidate @submit.prevent="save">
        <div>
          <label for="game" class="form-label">Jogo</label>
          <select id="game" v-model="form.slug" class="field-input" :disabled="!!editingSlug">
            <option value="">Selecione</option>
            <option v-for="game in availableGames" :key="game.slug" :value="game.slug">{{ game.name }}</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <FormField id="dpi" v-model="form.dpi" label="DPI" eyebrow placeholder="800" :error="fields.dpi" />
          <FormField id="sensitivity" v-model="form.sensitivity" label="Sensibilidade" eyebrow placeholder="0.35" :error="fields.sensitivity" />
          <FormField id="resolution" v-model="form.resolution" label="Resolução" eyebrow placeholder="1920x1080" :error="fields.resolution" />
          <FormField id="aspectRatio" v-model="form.aspectRatio" label="Proporção" eyebrow placeholder="16:9" :error="fields.aspectRatio" />
          <FormField id="refreshRate" v-model="form.refreshRate" label="Taxa de atualização (Hz)" eyebrow placeholder="240" :error="fields.refreshRate" />
          <div>
            <span class="form-label">eDPI</span>
            <p class="field-input !bg-transparent font-mono tabular-nums">{{ edpi ?? '—' }}</p>
          </div>
        </div>
        <div class="flex justify-end gap-4 pt-2">
          <button type="button" class="btn-cancel" @click="formOpen = false">Cancelar</button>
          <button type="submit" class="btn-publish" :disabled="saving || !form.slug" :class="{ 'opacity-60': saving || !form.slug }">{{ saving ? 'Salvando...' : 'Salvar' }}</button>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { GameConfig } from '~/components/GameStats.vue'
import { toApiFailure } from '~/composables/useAuth'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Configurações de jogo · GearHub' })

const { user } = useAuth()
const toast = useToast()

const { data: games } = await useFetch<{ slug: string, name: string }[]>('/api/v1/games', { key: 'games' })
const { data: configsData, refresh } = await useFetch<GameConfig[]>(() => `/api/v1/users/${user.value?.username}/games`, {
  key: 'my-games',
})

const configs = computed(() => configsData.value ?? [])

const emptyForm = { slug: '', dpi: '', sensitivity: '', resolution: '', aspectRatio: '', refreshRate: '' }
const form = reactive({ ...emptyForm })
const fields = ref<Record<string, string>>({})
const formOpen = ref(false)
const editingSlug = ref('')
const saving = ref(false)

const availableGames = computed(() =>
  (games.value ?? []).filter(game => game.slug === editingSlug.value || !configs.value.some(config => config.slug === game.slug)),
)

const edpi = computed(() => {
  const value = Number(form.dpi) * Number(form.sensitivity)
  return form.dpi && form.sensitivity && Number.isFinite(value) ? value.toFixed(1) : null
})

function openForm(config?: GameConfig) {
  fields.value = {}
  editingSlug.value = config?.slug ?? ''
  Object.assign(form, emptyForm, config && {
    slug: config.slug,
    dpi: config.dpi?.toString() ?? '',
    sensitivity: config.sensitivity?.toString() ?? '',
    resolution: config.resolution ?? '',
    aspectRatio: config.aspectRatio ?? '',
    refreshRate: config.refreshRate?.toString() ?? '',
  })
  formOpen.value = true
}

const numberOrText = (value: string) => {
  const text = value.trim().replace(',', '.')
  return text === '' ? null : text
}

async function save() {
  fields.value = {}
  saving.value = true
  try {
    await $fetch(`/api/v1/me/games/${form.slug}`, {
      method: 'PUT',
      body: {
        dpi: numberOrText(form.dpi),
        sensitivity: numberOrText(form.sensitivity),
        resolution: form.resolution,
        aspectRatio: form.aspectRatio,
        refreshRate: numberOrText(form.refreshRate),
      },
    })
    formOpen.value = false
    await refresh()
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

async function remove(config: GameConfig) {
  try {
    await $fetch(`/api/v1/me/games/${config.slug}`, { method: 'DELETE' })
    await refresh()
  }
  catch (error) {
    toast.error(toApiFailure(error).message)
  }
}
</script>
