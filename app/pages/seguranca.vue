<template>
  <div>
    <PageHeader root title="Sua" accent="Segurança." subtitle="Proteja sua conta com a verificação em duas etapas." />

    <div class="px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
      <section class="max-w-2xl mx-auto glass-card p-5 sm:p-7" aria-labelledby="two-factor-title">
        <div class="flex items-start gap-4">
          <span class="w-11 h-11 shrink-0 rounded-2xl grid place-items-center bg-gear-accent/10 text-gear-accent">
            <AppIcon name="shield" class="w-5 h-5" />
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h2 id="two-factor-title" class="text-lg font-bold tracking-tight">Verificação em duas etapas</h2>
              <span
                class="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider"
                :class="enabled ? 'bg-gear-accent/15 text-gear-accent' : 'bg-gear-surface text-gear-muted'"
              >{{ enabled ? 'Ativa' : 'Desativada' }}</span>
            </div>
            <p class="text-sm text-gear-muted mt-1 leading-relaxed">
              Depois da senha, o GearHub pede um código de 6 dígitos do app autenticador do seu celular.
              Assim, mesmo quem descobrir sua senha não consegue entrar.
            </p>
          </div>
        </div>

        <!-- Desativada: explica e oferece ativar -->
        <div v-if="mode === 'idle' && !enabled" class="mt-6">
          <p class="text-sm text-gear-text-secondary leading-relaxed">
            Você vai precisar de um app autenticador gratuito, como Google Authenticator, Microsoft Authenticator, Authy ou o gerenciador de senhas que já usa.
          </p>
          <button type="button" class="btn-publish !py-0 min-h-[2.75rem] mt-5" :disabled="busy" @click="startSetup">
            <AppIcon name="shield" class="w-4 h-4" />
            {{ busy ? 'Aguarde...' : 'Ativar' }}
          </button>
        </div>

        <!-- Configuração: QR Code e primeiro código -->
        <div v-else-if="mode === 'setup' && setup" class="mt-6 space-y-6">
          <div>
            <p class="form-label">1. Escaneie com o app</p>
            <div class="flex flex-col sm:flex-row sm:items-center gap-5">
              <!-- QR Code gerado aqui no navegador: o segredo não passa por nenhum outro serviço -->
              <div class="w-44 h-44 shrink-0 rounded-2xl bg-white p-2 self-center sm:self-auto" role="img" aria-label="QR Code para o app autenticador" v-html="qrSvg" />
              <div class="min-w-0 text-sm text-gear-muted leading-relaxed">
                <p>No app, toque em adicionar conta e aponte a câmera para o código.</p>
                <p class="mt-3">Não consegue escanear? Digite esta chave no app:</p>
                <div class="mt-2 flex items-center gap-2">
                  <code class="min-w-0 break-all rounded-xl bg-gear-surface px-3 py-2 font-mono text-xs text-gear-text tracking-wider">{{ groupedSecret }}</code>
                  <button type="button" class="btn-outline !px-3 shrink-0" aria-label="Copiar chave" @click="copy(setup.secret, 'Chave copiada.')">
                    <AppIcon name="copy" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <form novalidate @submit.prevent="enable">
            <p class="form-label">2. Digite o código que aparece no app</p>
            <FormField id="setup-code" v-model="code" label="Código de 6 dígitos" autocomplete="one-time-code" inputmode="numeric" placeholder="000000" :error="fields.code" />
            <div class="flex flex-wrap gap-2 mt-4">
              <button type="submit" class="btn-publish !py-0 min-h-[2.75rem]" :disabled="busy || !code.trim()">
                <AppIcon name="check" class="w-4 h-4" />
                {{ busy ? 'Aguarde...' : 'Confirmar e ativar' }}
              </button>
              <button type="button" class="btn-outline" @click="reset">Cancelar</button>
            </div>
          </form>
        </div>

        <!-- Códigos de recuperação: só aparecem uma vez -->
        <div v-else-if="mode === 'codes'" class="mt-6">
          <div class="rounded-2xl border border-gear-accent/40 bg-gear-accent/5 p-4">
            <p class="text-sm font-semibold">Guarde seus códigos de recuperação</p>
            <p class="text-xs text-gear-muted mt-1 leading-relaxed">
              Se perder o celular, cada código entra uma vez no lugar do app. Eles não vão aparecer de novo:
              copie, baixe ou anote e guarde num lugar seguro.
            </p>
          </div>
          <ul class="grid grid-cols-2 gap-2 mt-4 font-mono text-sm" aria-label="Códigos de recuperação">
            <li v-for="item in recoveryCodes" :key="item" class="rounded-xl bg-gear-surface px-3 py-2 text-center tracking-wider">{{ item }}</li>
          </ul>
          <div class="flex flex-wrap gap-2 mt-5">
            <button type="button" class="btn-outline" @click="copy(codesText, 'Códigos copiados.')">
              <AppIcon name="copy" class="w-4 h-4" />
              Copiar
            </button>
            <button type="button" class="btn-outline" @click="download">
              <AppIcon name="download" class="w-4 h-4" />
              Baixar .txt
            </button>
            <button type="button" class="btn-publish !py-0 min-h-[2.75rem] sm:ml-auto" @click="reset">
              <AppIcon name="check" class="w-4 h-4" />
              Já guardei
            </button>
          </div>
        </div>

        <!-- Gerar códigos novos -->
        <form v-else-if="mode === 'regenerate'" class="mt-6" novalidate @submit.prevent="regenerate">
          <p class="text-sm text-gear-text-secondary mb-4">Os códigos antigos deixam de valer. Para confirmar, digite um código do app.</p>
          <FormField id="regenerate-code" v-model="code" label="Código do app ou de recuperação" autocomplete="one-time-code" :error="fields.code" />
          <div class="flex flex-wrap gap-2 mt-4">
            <button type="submit" class="btn-publish !py-0 min-h-[2.75rem]" :disabled="busy || !code.trim()">{{ busy ? 'Aguarde...' : 'Gerar novos códigos' }}</button>
            <button type="button" class="btn-outline" @click="reset">Cancelar</button>
          </div>
        </form>

        <!-- Desativar -->
        <form v-else-if="mode === 'disable'" class="mt-6 space-y-4" novalidate @submit.prevent="disable">
          <p class="text-sm text-gear-text-secondary">Sem a verificação, só a senha protege sua conta.</p>
          <FormField v-if="user?.hasPassword" id="disable-password" v-model="password" label="Sua senha" type="password" autocomplete="current-password" :error="fields.password" />
          <FormField id="disable-code" v-model="code" label="Código do app ou de recuperação" autocomplete="one-time-code" :error="fields.code" />
          <div class="flex flex-wrap gap-2">
            <button type="submit" class="btn-outline !border-gear-red/60 !text-gear-red" :disabled="busy || !code.trim()">{{ busy ? 'Aguarde...' : 'Desativar' }}</button>
            <button type="button" class="btn-outline" @click="reset">Cancelar</button>
          </div>
        </form>

        <!-- Ativa -->
        <div v-else-if="enabled" class="mt-6">
          <p class="text-sm" :class="codesLeft <= 2 ? 'text-gear-red' : 'text-gear-text-secondary'">
            {{ codesLeft === 1 ? 'Resta 1 código de recuperação.' : `Restam ${codesLeft} códigos de recuperação.` }}
            <template v-if="codesLeft <= 2"> Gere novos para não ficar sem acesso se perder o celular.</template>
          </p>
          <div class="flex flex-wrap gap-2 mt-4">
            <button type="button" class="btn-outline" @click="open('regenerate')">
              <AppIcon name="refresh-cw" class="w-4 h-4" />
              Gerar novos códigos
            </button>
            <button type="button" class="btn-outline !text-gear-red" @click="open('disable')">Desativar</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { renderSVG } from 'uqr'
import { toApiFailure } from '~/composables/useAuth'

useHead({ title: 'Segurança · GearHub' })

interface Status { enabled: boolean, recoveryCodesLeft: number }
interface Setup { secret: string, otpauthUri: string }
type Mode = 'idle' | 'setup' | 'codes' | 'regenerate' | 'disable'

const { user, refresh: refreshUser } = useAuth()
const toast = useToast()
const { data: status, refresh: refreshStatus } = await useFetch<Status>('/api/v1/me/2fa', { key: 'two-factor' })

const enabled = computed(() => status.value?.enabled ?? false)
const codesLeft = computed(() => status.value?.recoveryCodesLeft ?? 0)

const mode = ref<Mode>('idle')
const busy = ref(false)
const setup = ref<Setup | null>(null)
const recoveryCodes = ref<string[]>([])
const code = ref('')
const password = ref('')
const fields = ref<Record<string, string>>({})

const qrSvg = computed(() => (setup.value ? renderSVG(setup.value.otpauthUri, { border: 1 }) : ''))
const groupedSecret = computed(() => setup.value?.secret.match(/.{1,4}/g)?.join(' ') ?? '')
const codesText = computed(() => [
  `Códigos de recuperação do GearHub (@${user.value?.username ?? ''})`,
  'Cada código entra uma vez no lugar do app autenticador.',
  '',
  ...recoveryCodes.value,
].join('\n'))

function open(next: Mode) {
  code.value = ''
  password.value = ''
  fields.value = {}
  mode.value = next
}

function reset() {
  setup.value = null
  recoveryCodes.value = []
  open('idle')
}

// Erro de campo fica embaixo do campo; o resto vira aviso
async function run(action: () => Promise<void>) {
  fields.value = {}
  busy.value = true
  try {
    await action()
  }
  catch (error) {
    const failure = toApiFailure(error)
    fields.value = failure.fields
    if (!Object.keys(failure.fields).length) toast.error(failure.message)
  }
  finally {
    busy.value = false
  }
}

function startSetup() {
  return run(async () => {
    setup.value = await $fetch<Setup>('/api/v1/me/2fa/setup', { method: 'POST' })
    open('setup')
  })
}

function showCodes(codes: string[]) {
  recoveryCodes.value = codes
  setup.value = null
  open('codes')
}

function enable() {
  return run(async () => {
    const result = await $fetch<{ recoveryCodes: string[] }>('/api/v1/me/2fa/enable', { method: 'POST', body: { code: code.value } })
    showCodes(result.recoveryCodes)
    await Promise.all([refreshStatus(), refreshUser()])
    toast.success('Verificação ativada. As outras sessões da conta foram encerradas.')
  })
}

function regenerate() {
  return run(async () => {
    const result = await $fetch<{ recoveryCodes: string[] }>('/api/v1/me/2fa/recovery-codes', { method: 'POST', body: { code: code.value } })
    showCodes(result.recoveryCodes)
    await refreshStatus()
  })
}

function disable() {
  return run(async () => {
    await $fetch('/api/v1/me/2fa/disable', { method: 'POST', body: { password: password.value || null, code: code.value } })
    reset()
    await Promise.all([refreshStatus(), refreshUser()])
    toast.success('Verificação em duas etapas desativada.')
  })
}

async function copy(text: string, message: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(message)
  }
  catch {
    toast.error('Não foi possível copiar. Selecione e copie manualmente.')
  }
}

function download() {
  const url = URL.createObjectURL(new Blob([codesText.value], { type: 'text/plain;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'gearhub-codigos-de-recuperacao.txt'
  link.click()
  URL.revokeObjectURL(url)
}
</script>
