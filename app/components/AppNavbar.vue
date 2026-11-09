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
        class="w-full btn-primary !px-[15px] flex items-center justify-start gap-3 h-10 overflow-hidden"
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

  <!-- Cabeçalho (celular e tablet): só o que precisa estar sempre à mão -->
  <header class="lg:hidden sticky top-0 z-30 bg-gear-bg/85 backdrop-blur-xl border-b border-gear-border" style="padding-top: env(safe-area-inset-top)">
    <div class="flex items-center justify-between pl-4 pr-2 h-14">
      <AppLogo height-class="h-5" />
      <div class="flex items-center">
        <NuxtLink to="/notifications" aria-label="Notificações" class="w-11 h-11 grid place-items-center text-gear-muted rounded-lg" :class="{ '!text-gear-primary': isActive('/notifications') }">
          <AppIcon name="bell" class="w-5 h-5" />
        </NuxtLink>
        <NuxtLink v-if="user" :to="`/profile/${user.username}`" aria-label="Meu perfil" class="w-11 h-11 grid place-items-center rounded-lg">
          <UserPhoto :src="user.avatarUrl" :name="user.displayName" class="w-7 h-7 text-[11px]" />
        </NuxtLink>
        <NuxtLink v-else to="/auth" aria-label="Entrar / Cadastrar" class="w-11 h-11 grid place-items-center text-gear-muted rounded-lg">
          <AppIcon name="user" class="w-5 h-5" />
        </NuxtLink>
      </div>
    </div>
  </header>

  <!-- Navegação inferior (celular e tablet) -->
  <nav
    class="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-gear-sidebar/95 backdrop-blur-xl border-t border-gear-border"
    style="padding-bottom: env(safe-area-inset-bottom)"
    aria-label="Principal"
  >
    <div class="grid grid-cols-5 max-w-lg mx-auto px-1">
      <NuxtLink
        v-for="link in mobileLinks.slice(0, 2)"
        :key="link.to"
        :to="link.to"
        class="relative flex flex-col items-center justify-center gap-0.5 h-14 transition-colors"
        :class="isActive(link.to) ? 'text-gear-primary' : 'text-gear-muted'"
        :aria-current="isActive(link.to) ? 'page' : undefined"
      >
        <span v-if="isActive(link.to)" class="absolute top-0 h-0.5 w-8 rounded-full neon-bar" aria-hidden="true" />
        <AppIcon :name="link.icon" class="w-5 h-5" />
        <span class="text-[11px] font-medium tracking-tight">{{ link.label }}</span>
      </NuxtLink>

      <div class="grid place-items-center">
        <button
          type="button"
          aria-label="Nova Publicação"
          class="w-12 h-12 grid place-items-center rounded-2xl bg-gear-primary text-gear-on-primary active:scale-95 transition-transform"
          style="box-shadow: 0 4px 16px var(--neon-soft)"
          @click="start"
        >
          <AppIcon name="plus" class="w-6 h-6" />
        </button>
      </div>

      <NuxtLink
        v-for="link in mobileLinks.slice(2)"
        :key="link.to"
        :to="link.to"
        class="relative flex flex-col items-center justify-center gap-0.5 h-14 transition-colors"
        :class="isActive(link.to) ? 'text-gear-primary' : 'text-gear-muted'"
        :aria-current="isActive(link.to) ? 'page' : undefined"
      >
        <span v-if="isActive(link.to)" class="absolute top-0 h-0.5 w-8 rounded-full neon-bar" aria-hidden="true" />
        <AppIcon :name="link.icon" class="w-5 h-5" />
        <span class="text-[11px] font-medium tracking-tight">{{ link.label }}</span>
      </NuxtLink>

      <button
        type="button"
        class="relative flex flex-col items-center justify-center gap-0.5 h-14 transition-colors"
        :class="menuOpen || inMenu ? 'text-gear-primary' : 'text-gear-muted'"
        :aria-expanded="menuOpen"
        @click="menuOpen = true"
      >
        <span v-if="inMenu" class="absolute top-0 h-0.5 w-8 rounded-full neon-bar" aria-hidden="true" />
        <AppIcon name="menu" class="w-5 h-5" />
        <span class="text-[11px] font-medium tracking-tight">Mais</span>
      </button>
    </div>
  </nav>

  <MobileMenu :open="menuOpen" @close="menuOpen = false" @sign-out="signOut" />
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
    menuOpen.value = false
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

const shortcutLinks = computed(() => [
  ...(user.value ? [{ label: 'Meu nível', to: `/niveis/${user.value.username}`, icon: 'trending-up' }] : []),
  { label: 'Meu setup', to: '/setup', icon: 'monitor' },
  { label: 'Configurações de jogo', to: '/games', icon: 'gamepad' },
])

const mobileLinks = [
  { label: 'Feed', to: '/', icon: 'house' },
  { label: 'Explorar', to: '/explore', icon: 'compass' },
  { label: 'Rankings', to: '/rankings', icon: 'trophy' },
]

// O restante fica no menu "Mais"
const menuOpen = ref(false)
const MENU_ROUTES = ['/compare', '/hall', '/saved', '/setup', '/games', '/account']
const inMenu = computed(() => MENU_ROUTES.includes(route.path) || route.path === `/niveis/${user.value?.username}`)

watch(() => route.path, () => {
  menuOpen.value = false
})
</script>
