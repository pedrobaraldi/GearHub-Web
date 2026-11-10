<template>
  <div>
    <PageHeader root title="Suas" accent="Configurações." subtitle="Conta, segurança, notificações, aparência e seus dados." />

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8 grid lg:grid-cols-[220px_minmax(0,1fr)] gap-8">
      <!-- Menu das seções: lateral no desktop, em linha no celular -->
      <nav class="lg:sticky lg:top-6 self-start" aria-label="Seções das configurações">
        <ul class="flex lg:flex-col gap-1 overflow-x-auto -mx-1 px-1 pb-1 lg:pb-0">
          <li v-for="section in SECTIONS" :key="section.id" class="shrink-0">
            <a
              :href="`#${section.id}`"
              class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors"
              :class="active === section.id ? 'bg-gear-surface text-gear-text' : 'text-gear-muted hover:text-gear-text hover:bg-gear-surface/60'"
            >
              <AppIcon :name="section.icon" class="w-4 h-4" />
              {{ section.label }}
            </a>
          </li>
        </ul>
      </nav>

      <div class="min-w-0 space-y-12">
        <TwoFactorNudge />

        <section id="conta" data-section class="scroll-mt-24" aria-labelledby="conta-title">
          <h2 id="conta-title" class="font-display italic font-extrabold uppercase text-2xl mb-4">Conta</h2>
          <SettingsAccount />
        </section>

        <section id="seguranca" data-section class="scroll-mt-24 space-y-4" aria-labelledby="seguranca-title">
          <h2 id="seguranca-title" class="font-display italic font-extrabold uppercase text-2xl">Segurança</h2>
          <TwoFactorPanel />
          <SettingsSessions />
        </section>

        <section id="notificacoes" data-section class="scroll-mt-24" aria-labelledby="notificacoes-title">
          <h2 id="notificacoes-title" class="font-display italic font-extrabold uppercase text-2xl mb-4">Notificações</h2>
          <SettingsNotifications />
        </section>

        <section id="aparencia" data-section class="scroll-mt-24" aria-labelledby="aparencia-title">
          <h2 id="aparencia-title" class="font-display italic font-extrabold uppercase text-2xl mb-4">Aparência</h2>
          <div class="glass-card p-5">
            <h3 class="text-sm font-semibold">Tema</h3>
            <p class="text-xs text-gear-muted mt-1">Fica salvo neste navegador.</p>
            <div class="grid grid-cols-3 gap-2 mt-4 max-w-md" role="radiogroup" aria-label="Tema">
              <button
                v-for="theme in THEMES"
                :key="theme.value"
                type="button"
                role="radio"
                class="flex flex-col items-center gap-2 rounded-2xl border px-3 py-3 text-xs font-semibold transition-colors"
                :class="colorMode.preference === theme.value ? 'border-gear-accent bg-gear-accent/10 text-gear-text' : 'border-gear-border text-gear-muted hover:text-gear-text'"
                :aria-checked="colorMode.preference === theme.value"
                @click="colorMode.preference = theme.value"
              >
                <AppIcon :name="theme.icon" class="w-5 h-5" />
                {{ theme.label }}
              </button>
            </div>
          </div>
        </section>

        <section id="dados" data-section class="scroll-mt-24" aria-labelledby="dados-title">
          <h2 id="dados-title" class="font-display italic font-extrabold uppercase text-2xl mb-4">Seus dados</h2>
          <SettingsData />
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Configurações · GearHub' })

const SECTIONS = [
  { id: 'conta', label: 'Conta', icon: 'user' },
  { id: 'seguranca', label: 'Segurança', icon: 'shield' },
  { id: 'notificacoes', label: 'Notificações', icon: 'bell' },
  { id: 'aparencia', label: 'Aparência', icon: 'sun' },
  { id: 'dados', label: 'Seus dados', icon: 'download' },
]

const THEMES = [
  { value: 'dark', label: 'Escuro', icon: 'moon' },
  { value: 'light', label: 'Claro', icon: 'sun' },
  { value: 'system', label: 'Sistema', icon: 'monitor' },
]

const colorMode = useColorMode()

// O menu acompanha a seção que está na tela
const active = ref('conta')
let observer: IntersectionObserver | null = null
onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
    if (visible) active.value = visible.target.id
  }, { rootMargin: '-20% 0px -60% 0px' })
  document.querySelectorAll('[data-section]').forEach(section => observer!.observe(section))
})
onBeforeUnmount(() => observer?.disconnect())
</script>
