<template>
  <footer class="border-t border-gear-border bg-gear-card mt-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="sm:col-span-2 lg:col-span-1">
          <AppLogo class="mb-3" />
          <p class="text-gear-muted text-sm leading-relaxed">A comunidade brasileira de reviews, discussões e rankings de hardware e periféricos.</p>
        </div>

        <!-- Links -->
        <div>
          <h4 class="text-gear-text font-semibold text-sm mb-3">Explorar</h4>
          <ul class="space-y-2">
            <li v-for="link in exploreLinks" :key="link.to">
              <NuxtLink :to="link.to" class="text-gear-muted hover:text-gear-text text-sm transition-colors duration-200">{{ link.label }}</NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="text-gear-text font-semibold text-sm mb-3">Comunidade</h4>
          <ul class="space-y-2">
            <li v-for="link in communityLinks" :key="link.label">
              <a :href="link.href" class="text-gear-muted hover:text-gear-text text-sm transition-colors duration-200">{{ link.label }}</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="text-gear-text font-semibold text-sm mb-3">Categorias</h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="cat in quickCategories"
              :key="cat"
              class="text-xs text-gear-muted bg-gear-surface px-2 py-1 rounded-md hover:text-gear-primary hover:bg-gear-primary/10 cursor-pointer transition-all duration-200"
            >{{ cat }}</span>
          </div>
        </div>
      </div>

      <div class="border-t border-gear-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p class="text-gear-muted text-xs">© 2024 GearHub. Todos os direitos reservados.</p>
        <div class="flex items-center gap-4">
          <a href="#" class="text-gear-muted hover:text-gear-text text-xs transition-colors">Privacidade</a>
          <a href="#" class="text-gear-muted hover:text-gear-text text-xs transition-colors">Termos</a>
          <a href="#" class="text-gear-muted hover:text-gear-text text-xs transition-colors">Contato</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const exploreLinks = [
  { label: 'Feed da Comunidade', to: '/' },
  { label: 'Rankings', to: '/rankings' },
  { label: 'Comparar Produtos', to: '/compare' },
  { label: 'Hall of Fame', to: '/hall' },
]

const communityLinks = [
  { label: 'Discord', href: '#' },
  { label: 'Twitter / X', href: '#' },
  { label: 'YouTube', href: '#' },
  { label: 'Instagram', href: '#' },
]

const quickCategories = ['Mouse', 'Teclado', 'Headset', 'Mousepad', 'GPU', 'Monitor', 'SSD', 'CPU']
</script>
