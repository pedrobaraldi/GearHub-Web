<template>
  <!-- Conta: e-mail, senha e contas ligadas (Google e Discord) -->
  <div v-if="account" class="space-y-4">
    <!-- E-mail -->
    <div class="glass-card p-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <h3 class="text-sm font-semibold">E-mail</h3>
          <p class="text-sm text-gear-text-secondary mt-1 break-all">{{ account.email }}</p>
          <p class="text-[11px] mt-1" :class="account.emailVerified ? 'text-gear-green' : 'text-gear-muted'">{{ account.emailVerified ? 'Confirmado' : 'Não confirmado' }}</p>
        </div>
        <button v-if="open !== 'email'" type="button" class="btn-outline !px-3 !py-1.5 text-xs" @click="toggle('email')">Trocar e-mail</button>
      </div>
      <form v-if="open === 'email'" class="mt-4 space-y-3" novalidate @submit.prevent="changeEmail">
        <p v-if="!account.hasPassword" class="text-xs text-gear-muted">Crie uma senha primeiro (logo abaixo): é com ela que você confirma a troca do e-mail.</p>
        <template v-else>
          <FormField id="new-email" v-model="emailForm.email" label="Novo e-mail" type="email" autocomplete="email" :error="fields.email" />
          <FormField id="email-password" v-model="emailForm.password" label="Sua senha" type="password" autocomplete="current-password" :error="fields.password" />
          <FormField v-if="account.twoFactorEnabled" id="email-code" v-model="emailForm.code" label="Código do app" autocomplete="one-time-code" :error="fields.code" />
        </template>
        <div class="flex gap-2">
          <button v-if="account.hasPassword" type="submit" class="btn-publish !py-0 min-h-[2.5rem]" :disabled="busy">{{ busy ? 'Salvando...' : 'Salvar e-mail' }}</button>
          <button type="button" class="btn-outline" @click="toggle(null)">Cancelar</button>
        </div>
      </form>
    </div>

    <!-- Senha -->
    <div class="glass-card p-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 class="text-sm font-semibold">Senha</h3>
          <p class="text-xs text-gear-muted mt-1">{{ account.hasPassword ? 'Trocar a senha encerra a conta nos outros aparelhos.' : 'Você entra só com Google ou Discord. Crie uma senha para ter outro jeito de entrar.' }}</p>
        </div>
        <button v-if="open !== 'password'" type="button" class="btn-outline !px-3 !py-1.5 text-xs" @click="toggle('password')">{{ account.hasPassword ? 'Trocar senha' : 'Criar senha' }}</button>
      </div>
      <form v-if="open === 'password'" class="mt-4 space-y-3" novalidate @submit.prevent="changePassword">
        <FormField v-if="account.hasPassword" id="current-password" v-model="passwordForm.currentPassword" label="Senha atual" type="password" autocomplete="current-password" :error="fields.currentPassword" />
        <div class="grid sm:grid-cols-2 gap-3 items-start">
          <FormField id="new-password" v-model="passwordForm.password" label="Nova senha" type="password" autocomplete="new-password" :error="fields.password" />
          <FormField id="new-password-confirmation" v-model="passwordForm.passwordConfirmation" label="Confirmar nova senha" type="password" autocomplete="new-password" :error="fields.passwordConfirmation || fields.passwordConfirmed" />
        </div>
        <PasswordRules :password="passwordForm.password" />
        <FormField v-if="account.twoFactorEnabled" id="password-code" v-model="passwordForm.code" label="Código do app" autocomplete="one-time-code" :error="fields.code" />
        <div class="flex gap-2">
          <button type="submit" class="btn-publish !py-0 min-h-[2.5rem]" :disabled="busy">{{ busy ? 'Salvando...' : 'Salvar senha' }}</button>
          <button type="button" class="btn-outline" @click="toggle(null)">Cancelar</button>
        </div>
      </form>
    </div>

    <!-- Contas ligadas -->
    <div class="glass-card p-5">
      <h3 class="text-sm font-semibold">Contas ligadas</h3>
      <p class="text-xs text-gear-muted mt-1">Entre com um clique. Para ligar uma conta, use o botão dela na tela de login com o mesmo e-mail.</p>
      <ul class="mt-4 divide-y divide-gear-border">
        <li v-for="provider in PROVIDERS" :key="provider.key" class="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
          <span class="text-sm font-medium">{{ provider.label }}</span>
          <button v-if="account.providers.includes(provider.key)" type="button" class="btn-outline !px-3 !py-1.5 text-xs" :disabled="busy" @click="disconnect(provider.key)">Desconectar</button>
          <span v-else class="text-xs text-gear-muted">Não ligada</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toApiFailure } from '~/composables/useAuth'

interface AccountOverview { email: string, emailVerified: boolean, hasPassword: boolean, providers: string[], twoFactorEnabled: boolean }

const PROVIDERS = [
  { key: 'google', label: 'Google' },
  { key: 'discord', label: 'Discord' },
]

const toast = useToast()
const { refresh: refreshUser } = useAuth()
const { data: account, refresh } = await useFetch<AccountOverview>('/api/v1/me/account', { key: 'me-account' })

const open = ref<'email' | 'password' | null>(null)
const busy = ref(false)
const fields = ref<Record<string, string>>({})
const emailForm = reactive({ email: '', password: '', code: '' })
const passwordForm = reactive({ currentPassword: '', password: '', passwordConfirmation: '', code: '' })

function toggle(section: 'email' | 'password' | null) {
  fields.value = {}
  Object.assign(emailForm, { email: '', password: '', code: '' })
  Object.assign(passwordForm, { currentPassword: '', password: '', passwordConfirmation: '', code: '' })
  open.value = section
}

async function run(action: () => Promise<void>) {
  fields.value = {}
  busy.value = true
  try {
    await action()
  }
  catch (error) {
    const failure = toApiFailure(error)
    fields.value = failure.fields
    toast.failure(failure)
  }
  finally {
    busy.value = false
  }
}

function changeEmail() {
  return run(async () => {
    await $fetch('/api/v1/me/account/email', { method: 'POST', body: { ...emailForm, code: emailForm.code || null } })
    toggle(null)
    await Promise.all([refresh(), refreshUser()])
    toast.success('E-mail trocado.')
  })
}

function changePassword() {
  return run(async () => {
    const created = !account.value?.hasPassword
    await $fetch('/api/v1/me/account/password', {
      method: 'POST',
      body: { ...passwordForm, currentPassword: passwordForm.currentPassword || null, code: passwordForm.code || null },
    })
    toggle(null)
    await Promise.all([refresh(), refreshUser()])
    toast.success(created ? 'Senha criada.' : 'Senha trocada. A conta foi encerrada nos outros aparelhos.')
  })
}

function disconnect(provider: string) {
  return run(async () => {
    await $fetch(`/api/v1/me/account/providers/${provider}`, { method: 'DELETE' })
    await refresh()
    toast.success('Conta desconectada.')
  })
}
</script>
