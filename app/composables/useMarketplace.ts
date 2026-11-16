// Marketplace: tipos e textos que as páginas da vitrine, da solicitação e da loja compartilham

export interface MarketProductCard {
  id: string
  name: string
  price: number | null
  image: string | null
  availability: Availability
  category: string | null
  storeSlug: string
  storeName: string
}

export interface MarketStoreCard {
  slug: string
  name: string
  logoUrl: string | null
  segment: string | null
  productCount: number
}

export interface MarketStorePage {
  slug: string
  name: string
  description: string | null
  logoUrl: string | null
  bannerUrl: string | null
  segment: string | null
  website: string | null
  instagram: string | null
  products: MarketProductCard[]
}

export interface MarketProductPage {
  id: string
  name: string
  description: string | null
  images: string[]
  price: number | null
  availability: Availability
  category: string | null
  storeSlug: string
  storeName: string
  storeLogoUrl: string | null
  buyPath: string
}

export type Availability = 'in_stock' | 'out_of_stock' | 'preorder'
export type ApplicationStatus = 'draft' | 'pending' | 'in_review' | 'awaiting_info' | 'approved' | 'rejected'
export type DocumentKind = 'cnpj_card' | 'social_contract' | 'responsible_id' | 'other'

export interface PartnerDocument {
  id: string
  kind: DocumentKind
  contentType: string
  sizeBytes: number
  createdAt: string
}

export interface PartnerApplication {
  id: string
  status: ApplicationStatus
  responsibleName: string | null
  cpfMasked: string | null
  contactEmail: string | null
  phone: string | null
  roleInCompany: string | null
  cnpj: string | null
  legalName: string | null
  tradeName: string | null
  segment: string | null
  address: string | null
  website: string | null
  description: string | null
  submittedAt: string | null
  decisionNote: string | null
  documents: PartnerDocument[]
  history: { fromStatus: string | null, toStatus: ApplicationStatus, note: string | null, createdAt: string }[]
  storeSlug: string | null
}

export interface MyStore {
  id: string
  slug: string
  name: string
  description: string | null
  logoUrl: string | null
  bannerUrl: string | null
  segment: string | null
  website: string | null
  instagram: string | null
  status: 'active' | 'suspended'
  suspendedNote: string | null
  clicksLast30Days: number
}

export interface MyProduct {
  id: string
  name: string
  description: string | null
  images: string[]
  category: string | null
  price: number | null
  availability: Availability
  purchaseUrl: string
  status: 'active' | 'paused' | 'archived'
  removedNote: string | null
  createdAt: string
  updatedAt: string
  clicksLast30Days: number
}

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  in_stock: 'Em estoque',
  out_of_stock: 'Sem estoque',
  preorder: 'Pré-venda',
}

export const APPLICATION_STATUS: Record<ApplicationStatus, { label: string, tone: string }> = {
  draft: { label: 'Rascunho', tone: 'bg-gear-surface text-gear-muted' },
  pending: { label: 'Enviada, aguardando análise', tone: 'bg-gear-accent/15 text-gear-accent' },
  in_review: { label: 'Em análise', tone: 'bg-gear-accent/15 text-gear-accent' },
  awaiting_info: { label: 'Aguardando informação', tone: 'bg-gear-warn/15 text-gear-warn' },
  approved: { label: 'Aprovada', tone: 'bg-gear-green/15 text-gear-green' },
  rejected: { label: 'Não aprovada', tone: 'bg-gear-red/15 text-gear-red' },
}

export const DOCUMENT_KINDS: { value: DocumentKind, label: string }[] = [
  { value: 'cnpj_card', label: 'Cartão CNPJ' },
  { value: 'social_contract', label: 'Contrato social' },
  { value: 'responsible_id', label: 'Documento do responsável' },
  { value: 'other', label: 'Outro' },
]

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatPrice(price: number | null | undefined): string | null {
  return price === null || price === undefined ? null : BRL.format(price)
}

/** Envia um arquivo para a API (multipart) e devolve a resposta. */
export function uploadFile<T>(path: string, file: File, query?: Record<string, string>): Promise<T> {
  const body = new FormData()
  body.append('file', file)
  return $fetch<T>(path, { method: 'POST', body, query })
}

// Máscaras: formatam enquanto a pessoa digita. A API aceita com ou sem pontuação
const onlyDigits = (value: string, max: number) => value.replace(/\D/g, '').slice(0, max)

export function formatCpf(value: string): string {
  const d = onlyDigits(value, 11)
  return d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2')
}

export function formatCnpj(value: string): string {
  const d = onlyDigits(value, 14)
  return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4').replace(/\/(\d{4})(\d{1,2})$/, '/$1-$2')
}

export function formatPhone(value: string): string {
  const d = onlyDigits(value, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
