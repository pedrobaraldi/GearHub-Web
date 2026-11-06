<template>
  <div class="min-h-screen grid lg:grid-cols-2">
    <!-- Apresentação da marca -->
    <aside class="hidden lg:flex flex-col justify-between p-14 bg-gear-sidebar border-r border-gear-border">
      <AppLogo />
      <div class="reveal max-w-md" v-reveal>
        <p class="editorial-eyebrow mb-4">A rede dos entusiastas</p>
        <h1 class="font-display italic font-extrabold uppercase leading-[0.95] tracking-tight text-6xl mb-5">
          Reviews honestos.<br>Hardware sério.<br><span class="neon-text">Comunidade real.</span>
        </h1>
        <p class="text-gear-muted leading-relaxed">Avalie, compare e descubra o melhor hardware com a profundidade que ele merece.</p>
      </div>
      <p class="text-xs text-gear-muted">© GearHub</p>
    </aside>

    <!-- Formulário -->
    <main class="flex flex-col p-6 sm:p-8">
      <div class="flex items-center justify-between gap-4">
        <BackButton />
        <AppLogo class="lg:hidden" height-class="h-6" />
      </div>

      <div class="flex-1 flex items-center justify-center py-8">
        <div class="reveal w-full max-w-sm" v-reveal>
          <p class="editorial-eyebrow mb-3">{{ isRegister ? 'Cadastro' : 'Acessar' }}</p>
          <h2 class="text-3xl font-semibold tracking-tight mb-8">{{ isRegister ? 'Crie sua conta' : 'Bem-vindo de volta' }}</h2>

          <button type="button" class="btn-outline w-full !py-2.5" :disabled="redirecting" @click="continueWith(loginWithGoogle)">
            <svg class="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.8z" />
              <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
              <path fill="#FBBC05" d="M5.3 14.300a7.200 7.200 0 0 1 0-4.600V6.600h-4a12 12 0 0 0 0 10.800l4-3.100z" />
              <path fill="#EA4335" d="M12 4.800c1.800 0 3.300.6 4.600 1.800l3.400-3.400A12 12 0 0 0 1.300 6.600l4 3.100c.9-2.900 3.600-4.900 6.700-4.900z" />
            </svg>
            Continuar com Google
          </button>

          <button type="button" class="btn-outline w-full !py-2.5 mt-3" :disabled="redirecting" @click="continueWith(loginWithDiscord)">
            <svg class="w-4 h-4 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.3 4.4A19.800 19.800 0 0 0 15.400 3l-.2.5a18 18 0 0 0-6.400 0L8.600 3a19.800 19.800 0 0 0-4.900 1.400C.6 9 -.2 13.500.2 18c2 1.500 4 2.400 6 3l1.300-2a12.900 12.900 0 0 1-2-.9l.5-.4a14.200 14.200 0 0 0 12 0l.5.4c-.6.4-1.300.7-2 .9l1.300 2c2-.6 4-1.500 6-3 .5-5.200-.8-9.600-3.500-13.600zM8 15.300c-1.200 0-2.100-1.100-2.100-2.400S6.800 10.500 8 10.500s2.200 1.100 2.100 2.400c0 1.300-.9 2.400-2.100 2.400zm8 0c-1.200 0-2.100-1.100-2.100-2.400s.9-2.400 2.100-2.400 2.200 1.100 2.100 2.400c0 1.300-.9 2.400-2.100 2.400z" />
            </svg>
            Continuar com Discord
          </button>

          <div class="flex items-center gap-3 my-5" aria-hidden="true">
            <span class="flex-1 h-px bg-gear-border" />
            <span class="text-[10px] uppercase tracking-widest text-gear-muted">ou</span>
            <span class="flex-1 h-px bg-gear-border" />
          </div>

          <form class="space-y-4" novalidate @submit.prevent="submit">
            <template v-if="isRegister">
              <FormField id="displayName" v-model="form.displayName" label="Nome" autocomplete="name" :error="fields.displayName" />
              <FormField
                id="username"
                :model-value="form.username"
                label="Nome de usuário"
                autocomplete="username"
                hint="De 3 a 30 letras minúsculas ou números."
                :error="fields.username"
                @update:model-value="setUsername"
              />
            </template>

            <FormField id="email" v-model="form.email" label="E-mail" type="email" autocomplete="email" :error="fields.email" />
            <FormField
              id="password"
              v-model="form.password"
              label="Senha"
              type="password"
              :autocomplete="isRegister ? 'new-password' : 'current-password'"
              :error="fields.password"
            />

            <template v-if="isRegister">
              <!-- Só orienta enquanto digita; quem valida e dá o erro é a API -->
              <ul class="grid grid-cols-2 gap-x-3 gap-y-1" aria-label="Requisitos da senha">
                <li
                  v-for="rule in passwordRules"
                  :key="rule.label"
                  class="flex items-center gap-1.5 text-xs transition-colors"
                  :class="rule.met ? 'text-gear-green' : 'text-gear-muted'"
                >
                  <AppIcon :name="rule.met ? 'check' : 'circle'" class="w-3.5 h-3.5 shrink-0" />
                  {{ rule.label }}
                </li>
              </ul>

              <FormField
                id="passwordConfirmation"
                v-model="form.passwordConfirmation"
                label="Confirmar senha"
                type="password"
                autocomplete="new-password"
                :error="fields.passwordConfirmation || fields.passwordConfirmed"
              />
            </template>

            <TurnstileWidget ref="turnstile" v-model="turnstileToken" />

            <button type="submit" class="btn-primary w-full !py-2.5" :disabled="sending" :class="{ 'opacity-60': sending }">
              {{ sending ? 'Aguarde...' : isRegister ? 'Criar conta' : 'Entrar' }}
            </button>
          </form>

          <p class="text-sm text-gear-muted text-center mt-6">
            {{ isRegister ? 'Já tem uma conta?' : 'Novo na GearHub?' }}
            <button type="button" data-mode-switch class="font-semibold text-gear-primary hover:underline underline-offset-2" @click="toggleMode">
              {{ isRegister ? 'Entrar' : 'Criar conta' }}
            </button>
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { toApiFailure } from '~/composables/useAuth'

definePageMeta({ layout: false })

const route = useRoute()
const { user, login, register, loginWithGoogle, loginWithDiscord } = useAuth()
const toast = useToast()

const mode = ref<'login' | 'register'>(route.query.modo === 'cadastro' ? 'register' : 'login')
const isRegister = computed(() => mode.value === 'register')

useHead({ title: () => `${isRegister.value ? 'Criar conta' : 'Entrar'} · GearHub` })

// Só caminhos internos: evita redirecionar para sites externos depois do login
const redirectTarget = computed(() => {
  const target = route.query.redirect
  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') ? target : '/'
})

if (user.value) {
  await navigateTo(redirectTarget.value, { replace: true })
}

const redirecting = ref(false)

async function continueWith(provider: () => Promise<void>) {
  redirecting.value = true
  try {
    await provider()
  }
  catch (error) {
    toast.error(toApiFailure(error).message)
    redirecting.value = false
  }
}

// Volta do Google ou do Discord com erro: o site só tem o código, e o texto vem do backend
onMounted(async () => {
  const code = route.query.erro
  if (typeof code !== 'string') return
  try {
    const { detail } = await $fetch<{ detail: string }>(`/api/v1/auth/errors/${encodeURIComponent(code)}`)
    toast.error(detail)
  }
  catch (error) {
    toast.error(toApiFailure(error).message)
  }
})

const form = reactive({ displayName: '', username: '', email: '', password: '', passwordConfirmation: '' })
const fields = ref<Record<string, string>>({})
const sending = ref(false)
const turnstile = ref<{ reset: () => void } | null>(null)
const turnstileToken = ref('')

const passwordRules = computed(() => {
  const { password } = form
  return [
    { label: '8 caracteres', met: password.length >= 8 },
    { label: 'Letra maiúscula', met: /\p{Lu}/u.test(password) },
    { label: 'Número', met: /\d/.test(password) },
    { label: 'Caractere especial', met: /[^\p{L}\p{N}\s]/u.test(password) },
  ]
})

function toggleMode() {
  mode.value = isRegister.value ? 'login' : 'register'
  fields.value = {}
}

function setUsername(value: string) {
  form.username = value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

async function submit() {
  fields.value = {}
  sending.value = true
  try {
    if (isRegister.value) {
      await register({ ...form, turnstileToken: turnstileToken.value })
    }
    else {
      await login(form.email, form.password, turnstileToken.value)
    }
    await navigateTo(redirectTarget.value)
  }
  catch (error) {
    const failure = toApiFailure(error)
    fields.value = failure.fields
    toast.error(failure.message)
    turnstile.value?.reset()
  }
  finally {
    sending.value = false
  }
}
</script>
