<template>
  <!-- Barra lateral (desktop) -->
  <aside
    class="hidden lg:flex bg-gear-sidebar border-r border-gear-border flex-col fixed h-screen z-30 overflow-y-auto overflow-x-hidden transition-[width] duration-200 ease-out"
    :class="collapsed ? 'w-[72px]' : 'w-64'"
  >
    <!-- Altura fixa para os itens não mudarem de lugar ao recolher -->
    <div class="relative shrink-0 h-[112px]">
      <div
        class="absolute left-[21px] top-6 overflow-hidden transition-[max-width] duration-200 ease-out"
        :class="collapsed ? 'max-w-[30px]' : 'max-w-[160px]'"
      >
        <AppLogo />
      </div>
      <button
        ref="toggle"
        type="button"
        :aria-expanded="!collapsed"
        :aria-label="collapsed ? 'Expandir menu' : 'Recolher menu'"
        :title="collapsed ? 'Expandir menu' : 'Recolher menu'"
        class="absolute right-5 w-8 h-8 grid place-items-center rounded-lg text-gear-muted hover:text-gear-text hover:bg-gear-surface/60 transition-[top,color,background-color] duration-200 ease-out"
        :class="collapsed ? 'top-[62px]' : 'top-[22px]'"
        @click="collapsed = !collapsed"
      >
        <AppIcon :name="collapsed ? 'panel-left-open' : 'panel-left-close'" class="w-[18px] h-[18px]" />
      </button>
    </div>

    <nav class="mx-3 space-y-0.5" aria-label="Principal">
      <NuxtLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        :aria-label="collapsed ? link.label : undefined"
        :title="collapsed ? link.label : undefined"
        class="flex items-center gap-3 h-10 px-[15px] rounded-lg text-sm font-medium overflow-hidden transition-colors duration-200"
        :class="isActive(link.to)
          ? 'bg-gear-surface text-gear-primary'
          : 'text-gear-muted hover:text-gear-text hover:bg-gear-surface/60'"
      >
        <AppIcon :name="link.icon" class="w-[18px] h-[18px] shrink-0" />
        <span class="whitespace-nowrap transition-opacity duration-150" :class="{ 'opacity-0': collapsed }">{{ link.label }}</span>
      </NuxtLink>
    </nav>

    <div class="mx-3 mt-5">
      <button
        type="button"
        :aria-label="collapsed ? 'Nova Publicação' : undefined"
        :title="collapsed ? 'Nova Publicação' : undefined"
        class="w-full btn-primary !px-[15px] flex items-center gap-3 h-10 overflow-hidden"
        @click="start"
      >
        <AppIcon name="plus" class="w-[18px] h-[18px] shrink-0" />
        <span class="whitespace-nowrap transition-opacity duration-150" :class="{ 'opacity-0': collapsed }">Nova Publicação</span>
      </button>
    </div>

    <nav class="mx-3 mt-5 space-y-0.5" aria-label="Atalhos">
      <p class="editorial-eyebrow h-6 px-[15px] overflow-hidden whitespace-nowrap transition-opacity duration-150" :class="{ 'opacity-0': collapsed }">Atalhos</p>
      <NuxtLink
        v-for="link in shortcutLinks"
        :key="link.to"
        :to="link.to"
        :aria-label="collapsed ? link.label : undefined"
        :title="collapsed ? link.label : undefined"
        class="flex items-center gap-3 h-9 px-[15px] rounded-lg text-[13px] font-medium overflow-hidden transition-colors duration-200"
        :class="isActive(link.to)
          ? 'bg-gear-surface text-gear-primary'
          : 'text-gear-muted hover:text-gear-text hover:bg-gear-surface/60'"
      >
        <AppIcon :name="link.icon" class="w-4 h-4 shrink-0" />
        <span class="whitespace-nowrap transition-opacity duration-150" :class="{ 'opacity-0': collapsed }">{{ link.label }}</span>
      </NuxtLink>
    </nav>

    <div class="mt-auto mx-3 py-3">
      <ThemeToggle nav :compact="collapsed" />
    </div>

    <div class="mx-3 py-3 border-t border-gear-border">

      <template v-if="user">
        <div class="flex gap-1" :class="collapsed ? 'flex-col' : 'items-center'">
          <NuxtLink
            :to="`/profile/${user.username}`"
            aria-label="Meu perfil"
            title="Meu perfil"
            class="flex-1 min-w-0 flex items-center gap-3 h-12 px-[7px] rounded-lg overflow-hidden hover:bg-gear-surface/60 transition-colors duration-200"
            :class="{ 'bg-gear-surface': isActive(`/profile/${user.username}`) }"
          >
            <UserPhoto :src="user.avatarUrl" :name="user.displayName" class="w-[34px] h-[34px] text-xs shrink-0" />
            <span v-if="!collapsed" class="min-w-0">
              <span class="block text-sm font-semibold truncate">{{ user.displayName }}</span>
              <span class="block text-[11px] text-gear-muted truncate">@{{ user.username }}</span>
            </span>
          </NuxtLink>
          <button
            type="button"
            aria-label="Sair"
            title="Sair"
            class="w-9 h-10 mx-auto grid place-items-center shrink-0 rounded-lg text-gear-muted hover:text-gear-text hover:bg-gear-surface/60 transition-colors duration-200"
            @click="signOut"
          >
            <AppIcon name="log-out" class="w-[18px] h-[18px]" />
          </button>
        </div>
      </template>

      <NuxtLink
        v-else
        to="/auth"
        :aria-label="collapsed ? 'Entrar / Cadastrar' : undefined"
        :title="collapsed ? 'Entrar / Cadastrar' : undefined"
        class="flex items-center gap-3 h-10 px-[15px] rounded-lg text-sm font-medium overflow-hidden hover:bg-gear-surface/60 transition-colors duration-200"
      >
        <AppIcon name="user" class="w-[18px] h-[18px] shrink-0" />
        <span class="whitespace-nowrap transition-opacity duration-150" :class="{ 'opacity-0': collapsed }">Entrar / Cadastrar</span>
      </NuxtLink>
    </div>
  </aside>

  <!-- Cabeçalho (celular e tablet) -->
  <header class="lg:hidden sticky top-0 z-30 bg-gear-bg/85 backdrop-blur-xl border-b border-gear-border">
    <div class="flex items-center justify-between px-4 h-12">
      <AppLogo height-class="h-5" />
      <div class="flex items-center">
        <ThemeToggle />
        <button type="button" aria-label="Nova Publicação" class="w-8 h-9 grid place-items-center text-gear-muted hover:text-gear-text rounded-lg" @click="start">
          <AppIcon name="plus" class="w-[18px] h-[18px]" />
        </button>
        <NuxtLink
          v-for="link in headerLinks"
          :key="link.to"
          :to="link.to"
          :aria-label="link.label"
          class="w-8 h-9 grid place-items-center text-gear-muted hover:text-gear-text rounded-lg"
        >
          <AppIcon :name="link.icon" class="w-[18px] h-[18px]" />
        </NuxtLink>
        <button
          v-if="user"
          type="button"
          aria-label="Sair"
          class="w-8 h-9 grid place-items-center text-gear-muted hover:text-gear-text rounded-lg"
          @click="signOut"
        >
          <AppIcon name="log-out" class="w-[18px] h-[18px]" />
        </button>
      </div>
    </div>
  </header>

  <!-- Navegação inferior (celular e tablet) -->
  <nav
    class="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-gear-sidebar/95 backdrop-blur-xl border-t border-gear-border"
    style="padding-bottom: env(safe-area-inset-bottom)"
    aria-label="Principal"
  >
    <div class="grid grid-cols-5 gap-1 px-2">
      <NuxtLink
        v-for="link in mobileLinks"
        :key="link.to"
        :to="link.to"
        class="flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg transition-colors"
        :class="isActive(link.to) ? 'text-gear-primary' : 'text-gear-muted hover:text-gear-text'"
      >
        <AppIcon :name="link.icon" class="w-5 h-5" />
        <span class="text-[10px] font-medium tracking-tight">{{ link.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { toApiFailure } from '~/composables/useAuth'

const collapsed = defineModel<boolean>('collapsed', { default: false })

// Ícone do botão gira ao recolher e expandir
const toggle = ref<HTMLElement | null>(null)

watch(collapsed, async () => {
  await nextTick()
  gsap.fromTo(
    toggle.value?.querySelector('svg') ?? null,
    { rotate: -90, scale: 0.6 },
    { rotate: 0, scale: 1, duration: 0.45, ease: 'back.out(2)' },
  )
})

const route = useRoute()
const isActive = (to: string) => route.path === to

const { user, logout } = useAuth()
const { start } = useNewPost()
const toast = useToast()

async function signOut() {
  try {
    await logout()
    await navigateTo('/')
  }
  catch (error) {
    toast.error(toApiFailure(error).message)
  }
}

const navLinks = [
  { label: 'Feed', to: '/', icon: 'house' },
  { label: 'Explorar', to: '/explore', icon: 'compass' },
  { label: 'Rankings', to: '/rankings', icon: 'trophy' },
  { label: 'Comparar', to: '/compare', icon: 'git-compare' },
  { label: 'Hall', to: '/hall', icon: 'medal' },
  { label: 'Notificações', to: '/notifications', icon: 'bell' },
  { label: 'Salvos', to: '/saved', icon: 'bookmark' },
]

const shortcutLinks = [
  { label: 'Busca global', to: '/search', icon: 'search' },
  { label: 'Meu setup', to: '/setup', icon: 'monitor' },
  { label: 'Configurações de jogo', to: '/games', icon: 'gamepad' },
]

const headerLinks = computed(() => [
  { label: 'Buscar', to: '/search', icon: 'search' },
  { label: 'Salvos', to: '/saved', icon: 'bookmark' },
  { label: 'Notificações', to: '/notifications', icon: 'bell' },
  user.value
    ? { label: 'Meu perfil', to: `/profile/${user.value.username}`, icon: 'user' }
    : { label: 'Entrar / Cadastrar', to: '/auth', icon: 'user' },
])

const mobileLinks = [
  { label: 'Feed', to: '/', icon: 'house' },
  { label: 'Explorar', to: '/explore', icon: 'compass' },
  { label: 'Rankings', to: '/rankings', icon: 'trophy' },
  { label: 'Comparar', to: '/compare', icon: 'git-compare' },
  { label: 'Hall', to: '/hall', icon: 'medal' },
]
</script>
