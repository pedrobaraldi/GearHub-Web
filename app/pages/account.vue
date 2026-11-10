<template>
  <div v-if="user">
    <FormShell title="Configurações" subtitle="Monte um perfil completo. Suas alterações são salvas a cada etapa." preview-label="Como seu perfil aparece">
    <div>
      <nav class="grid grid-cols-2 sm:grid-cols-4 gap-2" aria-label="Etapas">
        <button
          v-for="(item, index) in STEPS"
          :key="item.label"
          type="button"
          class="flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-xs font-semibold transition-colors"
          :class="index === step ? 'border-gear-accent bg-gear-accent/10 text-gear-text' : 'border-gear-border bg-gear-card text-gear-muted hover:text-gear-text'"
          :aria-current="index === step ? 'step' : undefined"
          @click="goTo(index)"
        >
          <span
            class="w-6 h-6 rounded-full grid place-items-center shrink-0"
            :class="index === step ? 'bg-gear-accent text-black' : index < step ? 'bg-gear-surface text-gear-accent' : 'bg-gear-surface'"
          >
            <AppIcon :name="index < step ? 'check' : item.icon" class="w-3.5 h-3.5" />
          </span>
          {{ item.label }}
        </button>
      </nav>

      <div class="h-1 rounded-full bg-gear-surface mt-5 mb-6 overflow-hidden">
        <div ref="bar" class="h-full rounded-full bg-gear-accent" />
      </div>

      <section ref="panel">
        <p class="text-xs text-gear-muted">Etapa {{ step + 1 }} de {{ STEPS.length }}</p>
        <h2 class="text-xl font-bold tracking-tight mt-1">{{ STEPS[step]!.title }}</h2>
        <p class="text-sm text-gear-muted mt-1 mb-6">{{ STEPS[step]!.subtitle }}</p>

        <!-- Identidade -->
        <div v-if="step === 0" class="space-y-4">
          <div class="grid sm:grid-cols-2 gap-4">
            <FormField id="username" v-model="form.username" label="Username" eyebrow autocomplete="username" hint="Apenas letras minúsculas e números." :error="fields.username" />
            <FormField id="displayName" v-model="form.displayName" label="Nome de exibição" eyebrow autocomplete="name" :error="fields.displayName" />
          </div>
          <div>
            <label for="bio" class="form-label">Bio</label>
            <textarea id="bio" v-model="form.bio" rows="4" placeholder="Sobre você, seus gostos, seu setup..." class="field-input" :class="{ 'field-error': fields.bio }" />
            <p v-if="fields.bio" class="text-xs text-gear-red mt-1.5">{{ fields.bio }}</p>
            <p class="text-xs mt-1.5 tabular-nums" :class="form.bio.length > BIO_MAX ? 'text-gear-red' : 'text-gear-muted'">{{ form.bio.length }}/{{ BIO_MAX }}</p>
          </div>
        </div>

        <!-- Visual -->
        <div v-else-if="step === 1" class="space-y-6">
          <div>
            <span class="form-label">Banner</span>
            <div class="relative">
              <label
                class="block h-44 rounded-2xl overflow-hidden border border-dashed cursor-pointer transition-colors"
                :class="dragging === 'banner' ? 'border-gear-accent' : 'border-gear-border hover:border-gear-accent'"
                @dragover.prevent="dragging = 'banner'"
                @dragleave="dragging = null"
                @drop.prevent="onDrop($event, 'banner')"
              >
                <img v-if="user.bannerUrl" :src="user.bannerUrl" alt="Banner do perfil" class="w-full h-full object-cover" />
                <span v-else class="h-full flex flex-col items-center justify-center gap-2 text-xs text-gear-muted bg-gear-surface">
                  <AppIcon name="image-plus" class="w-6 h-6" />
                  {{ uploading === 'banner' ? 'Enviando...' : 'Arraste ou clique para enviar' }}
                </span>
                <input type="file" :accept="ACCEPT" class="sr-only" aria-label="Escolher banner" :disabled="!!uploading" @change="onPick($event, 'banner')" />
              </label>
              <button v-if="user.bannerUrl" type="button" class="absolute top-2 right-2 w-8 h-8 grid place-items-center rounded-full bg-black/70 text-white" aria-label="Remover banner" @click="removeImage('banner')">
                <AppIcon name="x" class="w-4 h-4" />
              </button>
            </div>
            <p class="text-xs text-gear-muted mt-1.5">Recomendado: 1500×500. JPG, PNG ou WebP, até 2 MB.</p>
          </div>

          <div>
            <span class="form-label">Avatar</span>
            <div class="flex items-center gap-5">
              <div class="relative shrink-0">
                <label
                  class="block w-28 h-28 rounded-full overflow-hidden border border-dashed cursor-pointer transition-colors"
                  :class="dragging === 'avatar' ? 'border-gear-accent' : 'border-gear-border hover:border-gear-accent'"
                  @dragover.prevent="dragging = 'avatar'"
                  @dragleave="dragging = null"
                  @drop.prevent="onDrop($event, 'avatar')"
                >
                  <UserPhoto :src="user.avatarUrl" :name="user.displayName" class="w-full h-full text-3xl" />
                  <input type="file" :accept="ACCEPT" class="sr-only" aria-label="Escolher foto de perfil" :disabled="!!uploading" @change="onPick($event, 'avatar')" />
                </label>
                <button v-if="user.avatarUrl" type="button" class="absolute top-0 right-0 w-7 h-7 grid place-items-center rounded-full bg-black/70 text-white" aria-label="Remover foto de perfil" @click="removeImage('avatar')">
                  <AppIcon name="x" class="w-3.5 h-3.5" />
                </button>
              </div>
              <p class="text-xs text-gear-muted leading-relaxed">
                {{ uploading === 'avatar' ? 'Enviando...' : 'Sua foto aparece em todos os comentários, reviews e cards. Use uma imagem nítida e centralizada.' }}
              </p>
            </div>
            <p class="text-xs text-gear-muted mt-2">Quadrado, 400×400 ou maior.</p>
          </div>

          <!-- Contorno da foto: só os ranks já alcançados (e o RGB de fundador) podem ser escolhidos -->
          <fieldset>
            <legend class="form-label">Contorno da foto</legend>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Contorno da foto">
              <button
                v-for="option in ringChoices"
                :key="option.value"
                type="button"
                role="radio"
                class="flex flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-xs font-semibold transition-colors"
                :class="[
                  form.ringStyle === option.value ? 'border-gear-accent bg-gear-accent/10 text-gear-text' : 'border-gear-border text-gear-muted',
                  option.available ? 'hover:text-gear-text hover:border-gear-text/30' : 'opacity-50 cursor-not-allowed',
                ]"
                :aria-checked="form.ringStyle === option.value"
                :disabled="!option.available"
                :title="option.available ? option.label : `Liberado no nível ${option.minLevel}`"
                @click="form.ringStyle = option.value"
              >
                <span
                  class="relative rounded-full p-[3px]"
                  :class="{ 'founder-ring': ringOf(option.value).founder, grayscale: !option.available }"
                  :style="ringOf(option.value).founder ? undefined : { background: ringOf(option.value).color }"
                >
                  <UserPhoto :src="user.avatarUrl" :name="user.displayName" class="w-10 h-10 text-sm" />
                </span>
                <span class="text-center leading-tight">{{ option.label }}</span>
                <span v-if="!option.available" class="text-[11px] font-normal">Nível {{ option.minLevel }}</span>
              </button>
            </div>
            <p v-if="fields.ringStyle" class="text-xs text-gear-red mt-1.5">{{ fields.ringStyle }}</p>
            <p class="text-xs text-gear-muted mt-1.5">Novas cores são liberadas conforme você sobe de patente.</p>
          </fieldset>
        </div>

        <!-- Social -->
        <div v-else-if="step === 2" class="grid sm:grid-cols-2 gap-4">
          <FormField id="website" v-model="form.website" label="Website" eyebrow placeholder="https://..." :error="fields.website" />
          <FormField id="twitter" v-model="form.twitter" label="Twitter / X" eyebrow placeholder="@usuario" :error="fields.twitter" />
          <FormField id="instagram" v-model="form.instagram" label="Instagram" eyebrow placeholder="usuario" :error="fields.instagram" />
          <FormField id="youtube" v-model="form.youtube" label="YouTube" eyebrow placeholder="https://youtube.com/@canal" :error="fields.youtube" />
        </div>

        <!-- Revisar -->
        <dl v-else class="rounded-2xl border border-gear-border bg-gear-sidebar divide-y divide-gear-border">
          <div v-for="row in reviewRows" :key="row.label" class="grid grid-cols-[110px_1fr] gap-3 px-4 py-3">
            <dt class="editorial-eyebrow self-center">{{ row.label }}</dt>
            <dd class="text-sm break-words whitespace-pre-line">{{ row.value || '—' }}</dd>
          </div>
        </dl>
      </section>

      <div class="flex items-center justify-end gap-3 mt-6">
        <div class="flex items-center gap-2">
          <!-- Mesmo tamanho do Próximo: só muda o estilo (contorno) -->
          <button v-if="step > 0" type="button" class="btn-outline !rounded-xl !px-5 !py-0 min-h-[2.75rem] uppercase text-xs font-bold tracking-wider" @click="goTo(step - 1)">
            <AppIcon name="chevron-left" class="w-4 h-4" />
            Voltar
          </button>
          <button v-if="step < STEPS.length - 1" type="button" class="btn-publish !py-0 min-h-[2.75rem]" :disabled="saving" @click="goTo(step + 1)">
            Próximo
            <AppIcon name="chevron-right" class="w-4 h-4" />
          </button>
          <button v-else type="button" class="btn-publish !py-0 min-h-[2.75rem]" :disabled="saving" @click="finish">
            <AppIcon name="check" class="w-4 h-4" />
            Concluir
          </button>
        </div>
      </div>
    </div>

    <template #preview>
      <!-- Topo do perfil com o que está no formulário: banner, contorno, nome, @, bio e redes -->
      <div class="glass-card overflow-hidden">
        <div class="h-24 bg-gradient-to-br from-gear-card via-gear-sidebar to-gear-bg">
          <img v-if="user.bannerUrl" :src="user.bannerUrl" alt="" class="w-full h-full object-cover" />
        </div>
        <div class="px-4 pb-5 -mt-10">
          <span
            class="relative inline-block rounded-full p-[3px]"
            :class="{ 'founder-ring': ringOf(form.ringStyle).founder }"
            :style="ringOf(form.ringStyle).founder ? undefined : { background: ringOf(form.ringStyle).color }"
          >
            <UserPhoto :src="user.avatarUrl" :name="form.displayName || user.displayName" class="w-20 h-20 text-2xl border-2 border-gear-card" />
          </span>
          <p class="font-display italic font-extrabold uppercase text-2xl leading-none tracking-tight mt-3 break-words">{{ form.displayName || user.displayName }}</p>
          <p class="text-sm text-gear-muted mt-1">@{{ form.username || user.username }}</p>
          <p v-if="form.bio.trim()" class="text-sm text-gear-text-secondary leading-relaxed whitespace-pre-line break-words mt-3 line-clamp-4">{{ form.bio }}</p>
          <SocialLinks class="mt-4" :links="previewLinks" static />
        </div>
      </div>
    </template>
    </FormShell>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap'
import { toApiFailure } from '~/composables/useAuth'
import { ringAppearance } from '~/composables/useGearData'
import { socialLinks } from '~/utils/socialLinks'

const BIO_MAX = 240
const ACCEPT = 'image/jpeg,image/png,image/webp'

const STEPS = [
  { label: 'Identidade', icon: 'user', title: 'Quem é você?', subtitle: 'O básico que vai aparecer no topo do seu perfil.' },
  { label: 'Visual', icon: 'image-plus', title: 'Visual', subtitle: 'Arraste imagens ou clique para enviar. Elas são salvas na hora.' },
  { label: 'Social', icon: 'link', title: 'Redes', subtitle: 'Conecte seus perfis. Tudo opcional.' },
  { label: 'Revisar', icon: 'star', title: 'Tudo pronto', subtitle: 'Confira antes de finalizar.' },
]

// Em qual etapa fica cada campo: um erro leva a pessoa até ele
const FIELD_STEP: Record<string, number> = { username: 0, displayName: 0, bio: 0, ringStyle: 1, website: 2, twitter: 2, instagram: 2, youtube: 2 }

type ImageKind = 'avatar' | 'banner'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Configurações · GearHub' })

const { user, updateProfile, uploadAvatar, uploadBanner, removeAvatar, removeBanner } = useAuth()
const toast = useToast()

const form = reactive({
  username: user.value?.username ?? '',
  displayName: user.value?.displayName ?? '',
  bio: user.value?.bio ?? '',
  website: user.value?.website ?? '',
  twitter: user.value?.twitter ?? '',
  instagram: user.value?.instagram ?? '',
  youtube: user.value?.youtube ?? '',
  // Vazio é automático: cor do rank atual, ou RGB para fundador
  ringStyle: user.value?.ringStyle ?? '',
})
const fields = ref<Record<string, string>>({})
const step = ref(0)
const saving = ref(false)
const uploading = ref<ImageKind | null>(null)
const dragging = ref<ImageKind | null>(null)

// Redes como aparecem no perfil
const previewLinks = computed(() => socialLinks(form))

const reviewRows = computed(() => [
  { label: 'Username', value: form.username },
  { label: 'Nome', value: form.displayName },
  { label: 'Bio', value: form.bio },
  { label: 'Website', value: form.website },
  { label: 'Twitter', value: form.twitter },
  { label: 'Instagram', value: form.instagram },
  { label: 'YouTube', value: form.youtube },
  { label: 'Contorno', value: ringChoices.value.find(option => option.value === form.ringStyle)?.label },
])

// Opções de contorno: a API diz quais ranks a pessoa já liberou
interface RingOption { value: string, label: string, available: boolean, minLevel: number | null }
const ringOptions = ref<RingOption[]>([])
const isFounder = computed(() => ringOptions.value.some(option => option.value === 'founder'))
const ringChoices = computed<RingOption[]>(() => [
  { value: '', label: 'Automático', available: true, minLevel: null },
  ...ringOptions.value,
])
const ringOf = (value: string) => ringAppearance(value || null, user.value?.rankName ?? 'Cobre', isFounder.value)

onMounted(async () => {
  try {
    ringOptions.value = await $fetch<RingOption[]>('/api/v1/me/ring-styles')
  }
  catch {
    // Sem a lista, fica só o automático
  }
})

async function save() {
  fields.value = {}
  saving.value = true
  try {
    await updateProfile({ ...form })
    return true
  }
  catch (error) {
    const failure = toApiFailure(error)
    fields.value = failure.fields
    toast.failure(failure)
    const failed = Object.keys(failure.fields).map(key => FIELD_STEP[key]).find(index => index !== undefined)
    if (failed !== undefined) step.value = failed
    return false
  }
  finally {
    saving.value = false
  }
}

async function goTo(index: number) {
  if (index !== step.value && await save()) step.value = index
}

async function finish() {
  if (await save()) {
    toast.success('Perfil atualizado.')
    await navigateTo(`/profile/${form.username}`, { replace: true })
  }
}

async function send(kind: ImageKind, file?: File) {
  if (!file) return
  uploading.value = kind
  try {
    await (kind === 'avatar' ? uploadAvatar(file) : uploadBanner(file))
  }
  catch (error) {
    toast.error(toApiFailure(error).message)
  }
  finally {
    uploading.value = null
  }
}

function onPick(event: Event, kind: ImageKind) {
  const input = event.target as HTMLInputElement
  send(kind, input.files?.[0]).finally(() => {
    input.value = ''
  })
}

function onDrop(event: DragEvent, kind: ImageKind) {
  dragging.value = null
  send(kind, event.dataTransfer?.files[0])
}

async function removeImage(kind: ImageKind) {
  try {
    await (kind === 'avatar' ? removeAvatar() : removeBanner())
  }
  catch (error) {
    toast.error(toApiFailure(error).message)
  }
}

// A barra acompanha a etapa, e o conteúdo entra deslizando
const bar = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const progress = () => `${((step.value + 1) / STEPS.length) * 100}%`

onMounted(() => gsap.set(bar.value, { width: progress() }))

watch(step, (next, previous) => {
  gsap.to(bar.value, { width: progress(), duration: 0.45, ease: 'power3.out' })
  gsap.fromTo(panel.value, { autoAlpha: 0, x: next > previous ? 24 : -24 }, { autoAlpha: 1, x: 0, duration: 0.35, ease: 'power3.out', clearProps: 'transform' })
})
</script>
