<template>
  <div>
    <PageHeader root title="Suas" accent="Notificações." subtitle="Curtidas, comentários, novos seguidores e subidas de rank." />

    <div class="px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center justify-end mb-3">
          <NuxtLink :to="{ path: '/configuracoes', hash: '#notificacoes' }" class="text-xs font-medium text-gear-muted hover:text-gear-text inline-flex items-center gap-1.5">
            <AppIcon name="settings" class="w-3.5 h-3.5" />
            Escolher o que receber
          </NuxtLink>
        </div>

        <ol v-if="items.length" class="glass-card divide-y divide-gear-border overflow-hidden">
          <li v-for="item in items" :key="item.id">
            <NuxtLink :to="item.link" class="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-gear-surface" :class="{ 'bg-gear-accent/5': fresh.has(item.id) }">
              <span class="relative shrink-0">
                <UserPhoto v-if="item.actor" :src="item.actor.avatarUrl" :name="item.actor.displayName" class="w-10 h-10 text-xs" />
                <span v-else class="w-10 h-10 grid place-items-center rounded-full bg-gear-gold/15 text-gear-gold"><AppIcon name="trophy" class="w-5 h-5" /></span>
                <span class="absolute -bottom-1 -right-1 w-5 h-5 grid place-items-center rounded-full border-2 border-gear-card" :class="TYPES[item.type].class">
                  <AppIcon :name="TYPES[item.type].icon" class="w-2.5 h-2.5" />
                </span>
              </span>
              <span class="min-w-0 flex-1">
                <span class="block text-sm leading-snug">
                  <strong v-if="item.actor" class="font-semibold">{{ item.actor.displayName }}</strong>
                  {{ item.message }}
                </span>
                <span v-if="item.snippet" class="block text-xs text-gear-muted mt-0.5 line-clamp-2">“{{ item.snippet }}”</span>
                <span class="block text-[11px] text-gear-muted mt-1">{{ timeAgo(item.createdAt) }}</span>
              </span>
              <span v-if="fresh.has(item.id)" class="w-2 h-2 rounded-full bg-gear-accent shrink-0 mt-2" aria-label="Nova" />
            </NuxtLink>
          </li>
        </ol>

        <div v-else class="glass-card p-10 text-center">
          <AppIcon name="bell" class="w-8 h-8 mx-auto mb-4 text-gear-accent" />
          <p class="text-sm font-semibold mb-1">Nada por aqui ainda</p>
          <p class="text-xs text-gear-muted">Quando curtirem, comentarem ou seguirem você, aparece aqui.</p>
        </div>

        <div v-if="cursor" class="text-center mt-5">
          <button type="button" class="btn-outline" :disabled="loading" @click="loadMore">{{ loading ? 'Carregando...' : 'Ver mais antigas' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NotificationItem, NotificationPage } from '~/composables/useNotifications'

useHead({ title: 'Notificações · GearHub' })

const TYPES: Record<NotificationItem['type'], { icon: string, class: string }> = {
  like: { icon: 'heart', class: 'bg-gear-red text-white' },
  comment: { icon: 'message-square', class: 'bg-gear-accent text-black' },
  reply: { icon: 'message-square', class: 'bg-gear-accent text-black' },
  follow: { icon: 'user', class: 'bg-gear-green text-black' },
  rank_up: { icon: 'trending-up', class: 'bg-gear-gold text-black' },
}

const { markAllRead } = useNotifications()
const { data } = await useFetch<NotificationPage>('/api/v1/me/notifications', { key: 'notifications', query: { size: 20 } })

const items = ref<NotificationItem[]>(data.value?.items ?? [])
const cursor = ref<string | null>(data.value?.nextCursor ?? null)
const loading = ref(false)
// As que chegaram desde a última visita continuam destacadas nesta visita
const fresh = reactive(new Set(items.value.filter(item => !item.read).map(item => item.id)))

onMounted(markAllRead)

async function loadMore() {
  if (!cursor.value) return
  loading.value = true
  try {
    const page = await $fetch<NotificationPage>('/api/v1/me/notifications', { query: { size: 20, before: cursor.value } })
    items.value.push(...page.items)
    cursor.value = page.nextCursor
  }
  finally {
    loading.value = false
  }
}

function timeAgo(value: string) {
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60_000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `há ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `há ${hours} h`
  const days = Math.round(hours / 24)
  if (days < 7) return `há ${days} ${days === 1 ? 'dia' : 'dias'}`
  return new Date(value).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}
</script>
