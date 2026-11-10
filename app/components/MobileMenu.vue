<template>
  <AppModal :open="open" title="Menu" @close="$emit('close')">
    <NuxtLink
      v-if="user"
      :to="`/profile/${user.username}`"
      class="flex items-center gap-3 p-3 mb-3 rounded-2xl bg-gear-surface"
      @click="$emit('close')"
    >
      <UserPhoto :src="user.avatarUrl" :name="user.displayName" class="w-11 h-11 text-sm shrink-0" />
      <span class="flex-1 min-w-0">
        <span class="block text-sm font-semibold truncate">{{ user.displayName }}</span>
        <span class="block text-xs text-gear-muted truncate">@{{ user.username }}</span>
      </span>
      <AppIcon name="chevron-right" class="w-4 h-4 text-gear-muted shrink-0" />
    </NuxtLink>
    <NuxtLink v-else to="/auth" class="btn-primary w-full mb-3" @click="$emit('close')">Entrar / Cadastrar</NuxtLink>

    <nav class="grid grid-cols-3 gap-2" aria-label="Mais opções">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        data-card
        :to="link.to"
        class="flex flex-col items-center justify-center gap-2 min-h-[84px] px-1 rounded-2xl border border-gear-border text-center transition-colors"
        :class="route.path === link.to ? 'text-gear-primary bg-gear-surface' : 'text-gear-text-secondary'"
        @click="$emit('close')"
      >
        <AppIcon :name="link.icon" class="w-5 h-5" />
        <span class="text-xs font-medium leading-tight">{{ link.label }}</span>
      </NuxtLink>
    </nav>

    <div class="mt-3 pt-2 border-t border-gear-border">
      <ThemeToggle nav />
      <button
        v-if="user"
        type="button"
        class="flex items-center gap-3 w-full h-11 px-[15px] rounded-lg text-sm font-medium text-gear-red"
        @click="$emit('sign-out')"
      >
        <AppIcon name="log-out" class="w-[18px] h-[18px] shrink-0" />
        Sair
      </button>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
defineProps<{ open: boolean }>()
defineEmits<{ 'close': [], 'sign-out': [] }>()

const route = useRoute()
const { user } = useAuth()

const links = computed(() => [
  { label: 'Comparar', to: '/compare', icon: 'git-compare' },
  { label: 'Hall', to: '/hall', icon: 'medal' },
  { label: 'Games', to: '/mercado', icon: 'gamepad' },
  { label: 'Salvos', to: '/saved', icon: 'bookmark' },
  ...(user.value
    ? [
        { label: 'Meu nível', to: `/niveis/${user.value.username}`, icon: 'trending-up' },
        { label: 'Meu setup', to: '/setup', icon: 'monitor' },
        { label: 'Config. de jogo', to: '/games', icon: 'settings' },
        { label: 'Configurações', to: '/account', icon: 'settings' },
        { label: 'Segurança', to: '/seguranca', icon: 'shield' },
      ]
    : []),
])
</script>
