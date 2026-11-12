<template>
  <AuthPanel :title="title" :subtitle="subtitle">
    <div class="space-y-3">
      <button v-if="state === 'ready'" type="button" class="btn-primary w-full !py-2.5" :disabled="sending" :class="{ 'opacity-60': sending }" @click="confirm">
        {{ sending ? 'Confirmando...' : 'Confirmar novo e-mail' }}
      </button>
      <NuxtLink v-else :to="loggedIn ? '/configuracoes' : '/auth'" class="btn-primary w-full !py-2.5 text-center block">
        {{ loggedIn ? 'Ir para as Configurações' : 'Entrar' }}
      </NuxtLink>
    </div>
  </AuthPanel>
</template>

<script setup lang="ts">
import { toApiFailure } from '~/composables/useAuth'

definePageMeta({ layout: false, public: true })
// O token está na URL: não pode vazar para sites externos pelo Referer
useHead({ title: 'Confirmar e-mail · GearHub', meta: [{ name: 'referrer', content: 'no-referrer' }] })

const route = useRoute()
const toast = useToast()
const { user, refresh } = useAuth()

// Confirma com um clique, e não ao abrir: leitores de e-mail que abrem links sozinhos não trocam o e-mail
const state = ref<'ready' | 'done' | 'failed'>('ready')
const sending = ref(false)
const error = ref('')
const loggedIn = computed(() => !!user.value)

const title = computed(() => ({ ready: 'Confirme seu novo e-mail', done: 'E-mail confirmado', failed: 'Não deu certo' })[state.value])
const subtitle = computed(() => ({
  ready: 'Depois de confirmar, você passa a entrar com este endereço.',
  done: 'Pronto: a conta já usa o novo endereço.',
  failed: error.value || 'Este link é inválido ou expirou. Peça a troca de novo nas Configurações.',
})[state.value])

async function confirm() {
  sending.value = true
  try {
    await $fetch('/api/v1/auth/confirm-email', {
      method: 'POST',
      body: { token: typeof route.query.token === 'string' ? route.query.token : '' },
    })
    state.value = 'done'
    await refresh()
    toast.success('E-mail confirmado.')
  }
  catch (failure) {
    error.value = toApiFailure(failure).message
    state.value = 'failed'
  }
  finally {
    sending.value = false
  }
}
</script>
