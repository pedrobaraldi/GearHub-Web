<template>
  <!-- O que avisar: cada tipo liga e desliga na hora -->
  <div v-if="settings" class="glass-card divide-y divide-gear-border">
    <div v-for="option in OPTIONS" :key="option.key" class="flex items-center justify-between gap-4 p-4">
      <div class="min-w-0">
        <p class="text-sm font-medium">{{ option.label }}</p>
        <p class="text-xs text-gear-muted mt-0.5">{{ option.hint }}</p>
      </div>
      <button
        type="button"
        role="switch"
        class="relative w-11 h-6 shrink-0 rounded-full transition-colors"
        :class="settings[option.key] ? 'bg-gear-accent' : 'bg-gear-surface border border-gear-border'"
        :aria-checked="settings[option.key]"
        :aria-label="option.label"
        :disabled="saving"
        @click="toggle(option.key)"
      >
        <span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform" :class="{ 'translate-x-5': settings[option.key] }" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toApiFailure } from '~/composables/useAuth'

interface Settings { likes: boolean, comments: boolean, follows: boolean, rankUps: boolean }

const OPTIONS: { key: keyof Settings, label: string, hint: string }[] = [
  { key: 'likes', label: 'Curtidas', hint: 'Quando curtirem seus posts, reviews ou comentários.' },
  { key: 'comments', label: 'Comentários e respostas', hint: 'Quando comentarem no que você publicou ou responderem você.' },
  { key: 'follows', label: 'Novos seguidores', hint: 'Quando alguém começar a seguir você.' },
  { key: 'rankUps', label: 'Subida de rank', hint: 'Quando você alcançar uma nova patente.' },
]

const toast = useToast()
const { data: settings } = await useFetch<Settings>('/api/v1/me/notifications/settings', { key: 'notification-settings' })
const saving = ref(false)

async function toggle(key: keyof Settings) {
  if (!settings.value) return
  const previous = { ...settings.value }
  settings.value = { ...settings.value, [key]: !settings.value[key] }
  saving.value = true
  try {
    settings.value = await $fetch<Settings>('/api/v1/me/notifications/settings', { method: 'PUT', body: settings.value })
  }
  catch (error) {
    settings.value = previous
    toast.error(toApiFailure(error).message)
  }
  finally {
    saving.value = false
  }
}
</script>
