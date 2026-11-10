<template>
  <div>
    <FormHeader wide eyebrow="Configurações de jogo" title="Seus jogos favoritos" subtitle="Cadastre até 3 jogos com suas configurações e os equipamentos que você usa." />

    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">
      <div class="flex items-center justify-between gap-4">
        <p class="text-sm text-gear-muted">{{ configs.length }}/3 jogos cadastrados</p>
        <button type="button" class="btn-publish" :disabled="configs.length >= 3" :class="{ 'opacity-50': configs.length >= 3 }" @click="choosing = true">
          <AppIcon name="plus" class="w-4 h-4" />
          Adicionar jogo
        </button>
      </div>

      <div v-if="!configs.length" class="glass-card p-10 text-center">
        <AppIcon name="gamepad" class="w-8 h-8 mx-auto mb-3 text-gear-accent" />
        <p class="text-sm font-semibold mb-1">Nenhum jogo cadastrado ainda</p>
        <p class="text-xs text-gear-muted">Adicione um jogo para mostrar sua sensibilidade, crosshair e equipamentos no perfil.</p>
      </div>

      <article v-for="config in configs" :key="config.slug">
        <div class="flex items-center justify-between gap-3 mb-3">
          <div class="flex items-center gap-3 min-w-0">
            <GameIcon :slug="config.slug" :name="config.name" class="w-10 h-10" />
            <div class="min-w-0">
              <h2 class="font-semibold truncate">{{ config.name }}</h2>
              <p class="text-xs text-gear-muted truncate">{{ config.genre }}</p>
            </div>
          </div>
          <div class="flex items-center sm:gap-3 text-gear-muted shrink-0">
            <NuxtLink v-if="config.selectable" :to="`/games/${config.slug}`" class="hit !min-w-10 hover:text-gear-text transition-colors" :aria-label="`Editar ${config.name}`">
              <AppIcon name="pencil" class="w-4 h-4" />
            </NuxtLink>
            <button type="button" class="hit !min-w-10 hover:text-gear-red transition-colors" :aria-label="`Remover ${config.name}`" @click="removing = config">
              <AppIcon name="trash" class="w-4 h-4" />
            </button>
          </div>
        </div>
        <GameConfigView :config="config" />
      </article>
    </div>

    <AppModal :open="choosing" title="Adicionar jogo" subtitle="Escolha o jogo para cadastrar suas configurações." width-class="max-w-xl" @close="choosing = false">
      <div class="grid sm:grid-cols-2 gap-1">
        <NuxtLink
          v-for="game in availableGames"
          :key="game.slug"
          data-card
          :to="`/games/${game.slug}`"
          class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gear-surface transition-colors"
          @click="choosing = false"
        >
          <GameIcon :slug="game.slug" :name="game.name" class="w-10 h-10" />
          <span class="min-w-0">
            <span class="block text-sm font-medium truncate">{{ game.name }}</span>
            <span class="block text-xs text-gear-muted truncate">{{ game.genre }}</span>
          </span>
        </NuxtLink>
      </div>
      <p v-if="!availableGames.length" class="text-sm text-gear-muted text-center py-6">Você já cadastrou todos os jogos disponíveis.</p>
    </AppModal>

    <AppModal :open="!!removing" title="Remover jogo?" :subtitle="removing ? `As configurações de ${removing.name} serão apagadas.` : ''" @close="removing = null">
      <div class="flex justify-end gap-2">
        <button type="button" class="btn-outline" @click="removing = null">Cancelar</button>
        <button type="button" class="min-h-11 lg:min-h-0 px-4 py-2 rounded-lg text-sm font-medium bg-gear-red text-white hover:opacity-90 transition-opacity" @click="remove">Remover</button>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { GameConfig } from '~/components/GameConfigView.vue'
import { toApiFailure } from '~/composables/useAuth'

useHead({ title: 'Configurações de jogo · GearHub' })

const { user } = useAuth()
const toast = useToast()

const { data: games } = await useFetch<{ slug: string, name: string, genre: string }[]>('/api/v1/games', { key: 'games' })
const { data: configsData, refresh } = await useFetch<GameConfig[]>(() => `/api/v1/users/${user.value?.username}/games`, {
  key: 'my-games',
})

// Ao voltar do formulário a lista precisa estar atualizada
onMounted(() => refresh())

const configs = computed(() => configsData.value ?? [])
const choosing = ref(false)
const removing = ref<GameConfig | null>(null)

const availableGames = computed(() =>
  (games.value ?? []).filter(game => !configs.value.some(config => config.slug === game.slug)),
)

async function remove() {
  const config = removing.value
  if (!config) return
  removing.value = null
  try {
    await $fetch(`/api/v1/me/games/${config.slug}`, { method: 'DELETE' })
    await refresh()
  }
  catch (error) {
    toast.error(toApiFailure(error).message)
  }
}
</script>
