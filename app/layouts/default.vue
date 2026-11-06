<template>
  <div class="min-h-screen">
    <a href="#conteudo" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 btn-primary">Pular para o conteúdo</a>
    <AppNavbar v-model:collapsed="navCollapsed" />
    <NewPostModal />
    <div
      class="min-h-screen transition-[margin] duration-200 ease-out"
      :class="navCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'"
    >
      <main id="conteudo" class="min-w-0 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-0">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
// Em cookie, e não em localStorage, para o servidor já renderizar o estado certo
const navCollapsed = useCookie<boolean>('gearhub-nav-collapsed', {
  default: () => false,
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
})
</script>
