<template>
  <div>
    <PageHeader title="Abrir" accent="minha loja." subtitle="Peça para ser loja parceira do GearHub. A equipe analisa os dados e avisa você por aqui." back narrow />

    <div class="max-w-2xl mx-auto px-4 sm:px-0 py-6 space-y-5">
      <!-- Situação da solicitação -->
      <section v-if="application && application.status !== 'draft'" class="glass-card p-5 sm:p-6" role="status" aria-labelledby="status-title">
        <div class="flex items-start gap-4">
          <span class="w-11 h-11 shrink-0 rounded-2xl grid place-items-center" :class="APPLICATION_STATUS[application.status].tone">
            <AppIcon :name="STATUS_ICON[application.status]" class="w-5 h-5" />
          </span>
          <div class="min-w-0 flex-1 space-y-2">
            <p class="text-[11px] uppercase tracking-wider text-gear-muted font-bold">Situação da solicitação</p>
            <h2 id="status-title" class="text-lg font-bold leading-tight">{{ APPLICATION_STATUS[application.status].label }}</h2>
            <p class="text-sm text-gear-text-secondary leading-relaxed">{{ STATUS_TEXT[application.status] }}</p>
            <p v-if="application.decisionNote && ['awaiting_info', 'rejected'].includes(application.status)" class="text-sm rounded-xl bg-gear-surface px-3 py-2">
              <strong>Mensagem da equipe:</strong> {{ application.decisionNote }}
            </p>
            <NuxtLink v-if="application.storeSlug" to="/marketplace/minha-loja" class="btn-publish !py-0 min-h-[2.5rem] w-fit mt-1">
              <AppIcon name="store" class="w-4 h-4" /> Gerenciar minha loja
            </NuxtLink>
          </div>
        </div>
        <!-- Linha do tempo -->
        <ol v-if="timeline.length" class="mt-5 pt-4 border-t border-gear-border space-y-2">
          <li v-for="(event, index) in timeline" :key="index" class="flex gap-3 text-xs">
            <span class="w-2 h-2 rounded-full mt-1.5 shrink-0" :class="index === 0 ? 'bg-gear-accent' : 'bg-gear-border'" />
            <span class="text-gear-muted shrink-0 w-28">{{ formatDate(event.createdAt) }}</span>
            <span class="text-gear-text-secondary">{{ APPLICATION_STATUS[event.toStatus].label }}<span v-if="event.note"> · {{ event.note }}</span></span>
          </li>
        </ol>
      </section>

      <form v-if="editable" class="glass-card p-5 sm:p-6 space-y-6" novalidate @submit.prevent="next">
        <!-- Progresso -->
        <div>
          <div class="flex items-center justify-between text-xs text-gear-muted mb-2">
            <span>Etapa {{ step + 1 }} de {{ STEPS.length }}</span>
            <span class="font-semibold text-gear-text">{{ STEPS[step].title }}</span>
          </div>
          <div class="h-1.5 rounded-full bg-gear-surface overflow-hidden" role="progressbar" :aria-valuenow="step + 1" aria-valuemin="1" :aria-valuemax="STEPS.length">
            <div class="h-full bg-gear-accent transition-[width] duration-300" :style="{ width: `${((step + 1) / STEPS.length) * 100}%` }" />
          </div>
          <ol class="hidden sm:grid grid-cols-4 gap-2 mt-3">
            <li v-for="(item, index) in STEPS" :key="item.title">
              <button
                type="button"
                class="w-full text-left text-[11px] font-semibold uppercase tracking-wider transition-colors"
                :class="index === step ? 'text-gear-accent' : index < step ? 'text-gear-text-secondary hover:text-gear-text' : 'text-gear-muted'"
                :disabled="index > step || busy"
                @click="step = index"
              >
                {{ index + 1 }}. {{ item.title }}
              </button>
            </li>
          </ol>
        </div>

        <!-- 1. Responsável -->
        <fieldset v-show="step === 0" class="space-y-3">
          <legend class="sr-only">Responsável</legend>
          <p class="text-sm text-gear-muted">Quem responde pela loja diante do GearHub.</p>
          <FormField id="responsibleName" v-model="form.responsibleName" label="Nome completo" autocomplete="name" :error="fields.responsibleName" />
          <div class="grid sm:grid-cols-2 gap-3 items-start">
            <FormField
              id="cpf" v-model="form.cpf" label="CPF" inputmode="numeric" placeholder="000.000.000-00"
              :hint="application?.cpfMasked ? `Salvo: ${application.cpfMasked}. Deixe vazio para manter.` : 'Fica criptografado; só a equipe vê.'"
              :error="fields.cpf"
            />
            <FormField id="roleInCompany" v-model="form.roleInCompany" label="Função na empresa" placeholder="Sócio, gerente..." :error="fields.roleInCompany" />
            <FormField id="contactEmail" v-model="form.contactEmail" label="E-mail de contato" type="email" autocomplete="email" :error="fields.contactEmail" />
            <FormField id="phone" v-model="form.phone" label="Telefone" type="tel" autocomplete="tel" inputmode="numeric" placeholder="(11) 98765-4321" :error="fields.phone" />
          </div>
        </fieldset>

        <!-- 2. Empresa -->
        <fieldset v-show="step === 1" class="space-y-3">
          <legend class="sr-only">Empresa</legend>
          <p class="text-sm text-gear-muted">Os dados do CNPJ da loja.</p>
          <div class="grid sm:grid-cols-2 gap-3 items-start">
            <FormField id="cnpj" v-model="form.cnpj" label="CNPJ" inputmode="numeric" placeholder="00.000.000/0000-00" :error="fields.cnpj" />
            <FormField id="segment" v-model="form.segment" label="Segmento" placeholder="Periféricos, hardware..." :error="fields.segment" />
            <FormField id="legalName" v-model="form.legalName" label="Razão social" :error="fields.legalName" />
            <FormField id="tradeName" v-model="form.tradeName" label="Nome fantasia" hint="Vira o nome da loja no GearHub" :error="fields.tradeName" />
          </div>
          <FormField id="address" v-model="form.address" label="Endereço" autocomplete="street-address" :error="fields.address" />
          <FormField id="website" v-model="form.website" label="Site (opcional)" type="url" placeholder="https://" :error="fields.website" />
        </fieldset>

        <!-- 3. Operação -->
        <fieldset v-show="step === 2" class="space-y-3">
          <legend class="sr-only">Sobre a operação</legend>
          <label for="description" class="form-label">Conte como a loja funciona: o que vende, há quanto tempo, como entrega</label>
          <textarea id="description" v-model="form.description" rows="6" maxlength="2000" class="field-input" :aria-invalid="!!fields.description" />
          <div class="flex justify-between text-xs text-gear-muted">
            <span v-if="fields.description" class="field-error !mt-0">{{ fields.description }}</span>
            <span class="ml-auto">{{ form.description.length }}/2000</span>
          </div>
        </fieldset>

        <!-- 4. Documentos e envio -->
        <fieldset v-show="step === 3" class="space-y-4">
          <legend class="sr-only">Documentos</legend>
          <p class="text-sm text-gear-muted">PDF, JPG ou PNG de até 5 MB. Ficam criptografados e só a equipe do GearHub abre. Envie ao menos o cartão CNPJ.</p>
          <ul v-if="application?.documents.length" class="space-y-2">
            <li v-for="doc in application.documents" :key="doc.id" class="flex items-center justify-between gap-3 rounded-xl bg-gear-surface px-3 py-2 text-sm">
              <span class="flex items-center gap-2 min-w-0">
                <AppIcon name="file-text" class="w-4 h-4 text-gear-muted shrink-0" />
                <span class="truncate">{{ kindLabel(doc.kind) }}</span>
                <span class="text-xs text-gear-muted shrink-0">{{ (doc.sizeBytes / 1024).toFixed(0) }} KB</span>
              </span>
              <button type="button" class="text-xs text-gear-red hover:underline underline-offset-2 shrink-0" :disabled="busy" @click="removeDocument(doc.id)">Remover</button>
            </li>
          </ul>
          <div class="flex flex-col sm:flex-row gap-2 sm:items-center">
            <select v-model="docKind" class="field-input sm:max-w-[220px]" aria-label="Tipo do documento">
              <option v-for="kind in DOCUMENT_KINDS" :key="kind.value" :value="kind.value">{{ kind.label }}</option>
            </select>
            <label class="btn-outline cursor-pointer w-fit" :class="{ 'opacity-60': busy }">
              <AppIcon name="plus" class="w-4 h-4" /> Enviar documento
              <input type="file" accept="application/pdf,image/jpeg,image/png" class="sr-only" :disabled="busy" @change="addDocument">
            </label>
          </div>
          <p v-if="fields.documents || fields.file" class="field-error">{{ fields.documents || fields.file }}</p>

          <!-- Resumo antes de enviar -->
          <dl class="grid sm:grid-cols-2 gap-x-4 gap-y-2 text-sm rounded-xl border border-gear-border p-4">
            <div v-for="item in summary" :key="item.label" class="min-w-0">
              <dt class="text-xs text-gear-muted">{{ item.label }}</dt>
              <dd class="truncate" :class="item.value ? '' : 'text-gear-red'">{{ item.value || 'Falta preencher' }}</dd>
            </div>
          </dl>
          <p class="text-xs text-gear-muted">
            Ao enviar, você confirma que os dados são verdadeiros e que representa a empresa. A loja parceira vende no próprio site:
            o GearHub mostra os produtos e leva os clientes até lá.
          </p>
        </fieldset>

        <!-- Navegação -->
        <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-gear-border">
          <button v-if="step > 0" type="button" class="btn-outline" :disabled="busy" @click="step--">
            <AppIcon name="arrow-left" class="w-4 h-4" /> Voltar
          </button>
          <button type="button" class="btn-outline" :disabled="busy" @click="save(true)">Salvar rascunho</button>
          <button type="submit" class="btn-publish !py-0 min-h-[2.75rem] ml-auto" :disabled="busy">
            {{ busy ? 'Aguarde...' : step === STEPS.length - 1 ? 'Enviar para análise' : 'Continuar' }}
            <AppIcon v-if="step < STEPS.length - 1 && !busy" name="arrow-right" class="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toApiFailure } from '~/composables/useAuth'
import {
  APPLICATION_STATUS, DOCUMENT_KINDS, formatCnpj, formatCpf, formatPhone, uploadFile,
  type ApplicationStatus, type DocumentKind, type PartnerApplication, type PartnerDocument,
} from '~/composables/useMarketplace'

useHead({ title: 'Abrir minha loja · Marketplace · GearHub' })

// Cada etapa e os campos dela: um erro da API leva de volta à etapa do campo
const STEPS = [
  { title: 'Responsável', fields: ['responsibleName', 'cpf', 'roleInCompany', 'contactEmail', 'phone'] },
  { title: 'Empresa', fields: ['cnpj', 'segment', 'legalName', 'tradeName', 'address', 'website'] },
  { title: 'Operação', fields: ['description'] },
  { title: 'Documentos', fields: ['documents', 'file'] },
]
const STATUS_ICON: Record<ApplicationStatus, string> = {
  draft: 'pencil', pending: 'refresh-cw', in_review: 'eye', awaiting_info: 'alert', approved: 'check', rejected: 'x',
}
const STATUS_TEXT: Record<ApplicationStatus, string> = {
  draft: '',
  pending: 'Recebemos sua solicitação. Você recebe uma notificação quando a equipe responder.',
  in_review: 'A equipe está conferindo os dados e os documentos.',
  awaiting_info: 'A equipe precisa de mais informações. Complete abaixo e envie de novo.',
  approved: 'Sua loja foi aprovada. Já dá para montar o perfil e publicar produtos.',
  rejected: 'A solicitação não foi aprovada. Se quiser, corrija os dados abaixo e faça uma nova.',
}

const toast = useToast()
const { data: application, refresh } = await useFetch<PartnerApplication | null>('/api/v1/marketplace/application', {
  key: 'market-application',
  default: () => null,
})

// Rascunho ou complementação pedida: dá para editar. Recusada: o formulário vira uma nova solicitação
const editable = computed(() => !application.value || ['draft', 'awaiting_info', 'rejected'].includes(application.value.status))
const timeline = computed(() => [...(application.value?.history ?? [])].filter(event => event.toStatus !== 'draft').reverse())

const EMPTY = { responsibleName: '', cpf: '', contactEmail: '', phone: '', roleInCompany: '', cnpj: '', legalName: '', tradeName: '', segment: '', address: '', website: '', description: '' }
const form = reactive({ ...EMPTY })
function fill(source: PartnerApplication | null) {
  Object.assign(form, EMPTY)
  if (!source) return
  for (const key of Object.keys(EMPTY) as (keyof typeof EMPTY)[]) {
    // O CPF nunca volta da API (só mascarado): o campo fica vazio e mantém o salvo
    if (key !== 'cpf') form[key] = (source as unknown as Record<string, string | null>)[key] ?? ''
  }
}
fill(application.value)

// Máscaras enquanto digita
watch(() => form.cpf, value => { form.cpf = formatCpf(value) }, { immediate: true })
watch(() => form.cnpj, value => { form.cnpj = formatCnpj(value) }, { immediate: true })
watch(() => form.phone, value => { form.phone = formatPhone(value) }, { immediate: true })

const step = ref(0)
const fields = ref<Record<string, string>>({})
const busy = ref(false)
const docKind = ref<DocumentKind>('cnpj_card')
const kindLabel = (kind: DocumentKind) => DOCUMENT_KINDS.find(item => item.value === kind)?.label ?? kind
const formatDate = (iso: string) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })

const summary = computed(() => [
  { label: 'Responsável', value: form.responsibleName },
  { label: 'CPF', value: form.cpf || application.value?.cpfMasked },
  { label: 'Contato', value: [form.contactEmail, form.phone].filter(Boolean).join(' · ') },
  { label: 'CNPJ', value: form.cnpj },
  { label: 'Loja', value: form.tradeName },
  { label: 'Documentos', value: application.value?.documents.length ? `${application.value.documents.length} enviado(s)` : '' },
])

/** Volta para a primeira etapa que tem erro. */
function goToError() {
  const index = STEPS.findIndex(item => item.fields.some(field => fields.value[field]))
  if (index >= 0) step.value = index
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
    goToError()
    toast.failure(failure)
  }
  finally {
    busy.value = false
  }
}

async function persist() {
  application.value = await $fetch<PartnerApplication>('/api/v1/marketplace/application', { method: 'PUT', body: form })
  form.cpf = ''
}

function save(notify: boolean) {
  return run(async () => {
    await persist()
    if (notify) toast.success('Rascunho salvo.')
  })
}

/** Continuar salva o rascunho (a API confere CPF e CNPJ); na última etapa, envia. */
function next() {
  return run(async () => {
    await persist()
    if (step.value < STEPS.length - 1) {
      step.value++
      return
    }
    application.value = await $fetch<PartnerApplication>('/api/v1/marketplace/application/submit', { method: 'POST' })
    step.value = 0
    toast.success('Solicitação enviada. Avisamos você quando houver resposta.')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

function addDocument(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  return run(async () => {
    // Salva o rascunho antes: o documento entra na solicitação em andamento
    await persist()
    await uploadFile<PartnerDocument>('/api/v1/marketplace/application/documents', file, { kind: docKind.value })
    await refresh()
    toast.success('Documento enviado.')
  })
}

function removeDocument(id: string) {
  return run(async () => {
    await $fetch(`/api/v1/marketplace/application/documents/${id}`, { method: 'DELETE' })
    await refresh()
  })
}
</script>
