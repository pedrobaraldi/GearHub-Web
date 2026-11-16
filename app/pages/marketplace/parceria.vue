<template>
  <div>
    <PageHeader title="Abrir" accent="minha loja." subtitle="Peça para ser loja parceira do GearHub. A equipe analisa os dados e avisa você por aqui." back narrow />

    <div class="max-w-2xl mx-auto px-4 sm:px-0 py-6 space-y-5">
      <!-- Situação da solicitação -->
      <div v-if="application" class="glass-card p-5 space-y-3" role="status">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-semibold">Situação:</span>
          <span class="rounded-full px-2.5 py-0.5 text-xs font-bold" :class="APPLICATION_STATUS[application.status].tone">
            {{ APPLICATION_STATUS[application.status].label }}
          </span>
        </div>
        <p v-if="application.decisionNote && ['awaiting_info', 'rejected'].includes(application.status)" class="text-sm text-gear-text-secondary">
          <strong>Mensagem da equipe:</strong> {{ application.decisionNote }}
        </p>
        <p v-if="application.status === 'awaiting_info'" class="text-xs text-gear-muted">Complete o que foi pedido abaixo e envie de novo.</p>
        <p v-if="['pending', 'in_review'].includes(application.status)" class="text-xs text-gear-muted">Você recebe uma notificação quando houver resposta.</p>
        <p v-if="application.status === 'rejected'" class="text-xs text-gear-muted">Se quiser, corrija os dados e faça uma nova solicitação.</p>
        <NuxtLink v-if="application.storeSlug" to="/marketplace/minha-loja" class="btn-publish !py-0 min-h-[2.5rem] w-fit">
          <AppIcon name="store" class="w-4 h-4" /> Gerenciar minha loja
        </NuxtLink>
      </div>

      <form v-if="editable" class="space-y-5" novalidate @submit.prevent="submit">
        <section class="glass-card p-5 space-y-3" aria-labelledby="responsavel-title">
          <h2 id="responsavel-title" class="text-sm font-semibold">Responsável</h2>
          <FormField id="responsibleName" v-model="form.responsibleName" label="Nome completo" autocomplete="name" :error="fields.responsibleName" />
          <div class="grid sm:grid-cols-2 gap-3 items-start">
            <FormField
              id="cpf" v-model="form.cpf" label="CPF" inputmode="numeric" placeholder="000.000.000-00"
              :hint="application?.cpfMasked ? `Salvo: ${application.cpfMasked}. Deixe vazio para manter.` : 'Fica criptografado; só a equipe vê.'"
              :error="fields.cpf"
            />
            <FormField id="roleInCompany" v-model="form.roleInCompany" label="Função na empresa" placeholder="Sócio, gerente..." :error="fields.roleInCompany" />
            <FormField id="contactEmail" v-model="form.contactEmail" label="E-mail de contato" type="email" autocomplete="email" :error="fields.contactEmail" />
            <FormField id="phone" v-model="form.phone" label="Telefone" type="tel" autocomplete="tel" placeholder="(11) 98765-4321" :error="fields.phone" />
          </div>
        </section>

        <section class="glass-card p-5 space-y-3" aria-labelledby="empresa-title">
          <h2 id="empresa-title" class="text-sm font-semibold">Empresa</h2>
          <div class="grid sm:grid-cols-2 gap-3 items-start">
            <FormField id="cnpj" v-model="form.cnpj" label="CNPJ" inputmode="numeric" placeholder="00.000.000/0000-00" :error="fields.cnpj" />
            <FormField id="segment" v-model="form.segment" label="Segmento" placeholder="Periféricos, hardware..." :error="fields.segment" />
            <FormField id="legalName" v-model="form.legalName" label="Razão social" :error="fields.legalName" />
            <FormField id="tradeName" v-model="form.tradeName" label="Nome fantasia" hint="Vira o nome da loja no GearHub" :error="fields.tradeName" />
          </div>
          <FormField id="address" v-model="form.address" label="Endereço" autocomplete="street-address" :error="fields.address" />
          <FormField id="website" v-model="form.website" label="Site (opcional)" type="url" placeholder="https://" :error="fields.website" />
        </section>

        <section class="glass-card p-5 space-y-3" aria-labelledby="operacao-title">
          <h2 id="operacao-title" class="text-sm font-semibold">Sobre a operação</h2>
          <div>
            <label for="description" class="form-label">Conte como a loja funciona: o que vende, há quanto tempo, como entrega</label>
            <textarea id="description" v-model="form.description" rows="4" maxlength="2000" class="field-input" :aria-invalid="!!fields.description" />
            <p v-if="fields.description" class="field-error">{{ fields.description }}</p>
          </div>
        </section>

        <!-- Documentos -->
        <section class="glass-card p-5 space-y-3" aria-labelledby="docs-title">
          <h2 id="docs-title" class="text-sm font-semibold">Documentos para a validação</h2>
          <p class="text-xs text-gear-muted">PDF, JPG ou PNG de até 5 MB. Ficam criptografados e só a equipe do GearHub abre. Envie ao menos o cartão CNPJ.</p>
          <ul v-if="application?.documents.length" class="divide-y divide-gear-border">
            <li v-for="doc in application.documents" :key="doc.id" class="flex items-center justify-between gap-3 py-2 text-sm">
              <span>{{ kindLabel(doc.kind) }} <span class="text-xs text-gear-muted">· {{ (doc.sizeBytes / 1024).toFixed(0) }} KB</span></span>
              <button type="button" class="text-xs text-gear-red hover:underline underline-offset-2" :disabled="busy" @click="removeDocument(doc.id)">Remover</button>
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
        </section>

        <div class="flex flex-wrap gap-2">
          <button type="submit" class="btn-publish !py-0 min-h-[2.75rem]" :disabled="busy">{{ busy ? 'Aguarde...' : 'Enviar para análise' }}</button>
          <button type="button" class="btn-outline" :disabled="busy" @click="save(true)">Salvar rascunho</button>
        </div>
        <p class="text-xs text-gear-muted">
          Ao enviar, você confirma que os dados são verdadeiros e que representa a empresa. A loja parceira vende no próprio site:
          o GearHub mostra os produtos e leva os clientes até lá.
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toApiFailure } from '~/composables/useAuth'
import { APPLICATION_STATUS, DOCUMENT_KINDS, uploadFile, type DocumentKind, type PartnerApplication, type PartnerDocument } from '~/composables/useMarketplace'

useHead({ title: 'Abrir minha loja · Marketplace · GearHub' })

const toast = useToast()
const { data: application, refresh } = await useFetch<PartnerApplication | null>('/api/v1/marketplace/application', {
  key: 'market-application',
  default: () => null,
})

// Rascunho ou complementação pedida: dá para editar. Recusada: o formulário vira uma nova solicitação
const editable = computed(() => !application.value || ['draft', 'awaiting_info', 'rejected'].includes(application.value.status))

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

const fields = ref<Record<string, string>>({})
const busy = ref(false)
const docKind = ref<DocumentKind>('cnpj_card')
const kindLabel = (kind: DocumentKind) => DOCUMENT_KINDS.find(item => item.value === kind)?.label ?? kind

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

function submit() {
  return run(async () => {
    await persist()
    application.value = await $fetch<PartnerApplication>('/api/v1/marketplace/application/submit', { method: 'POST' })
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
