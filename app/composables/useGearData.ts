export interface User {
  id: string
  name: string
  username: string
  avatar: string
  badge: 'Cobre' | 'Prata' | 'Cobalto' | 'Esmeralda' | 'Platina' | 'Diamante'
  level: number
  pro?: boolean
  bio?: string
  ringStyle?: string | null
  founder?: boolean
}

export interface SubScore {
  label: string
  value: number
}

export interface Review {
  id: string
  user: User
  date: string
  product: Product
  title: string
  body: string
  score: number
  subScores: SubScore[]
  specs?: { label: string, value: string }[]
  unrated?: boolean
  images?: string[]
  // Review de jogo: o jogo do catálogo, com link para a página dele
  game?: { slug: string, name: string, coverUrl: string | null } | null
  likedByMe?: boolean
  savedByMe?: boolean
  mine?: boolean
  pros: string[]
  cons: string[]
  likes: number
  comments: number
  tags: string[]
  type: 'review' | 'post' | 'discussion' | 'question' | 'setup'
}

export interface Product {
  id: string
  name: string
  brand: string
  category: Category
  image?: string
  score?: number
  reviewCount?: number
  rank?: number
  about?: string
  specs?: { label: string; value: string }[]
}

export type Category = string

export const FEED_FILTERS = [
  { label: 'Todos', value: 'todos' },
  { label: 'Reviews', value: 'review' },
  { label: 'Posts', value: 'post' },
]

// Alguns produtos já trazem a marca no nome, como Wooting 80HE
export function productTitle(product: Pick<Product, 'brand' | 'name'>): string {
  return product.name.toLowerCase().startsWith(product.brand.toLowerCase()) ? product.name : `${product.brand} ${product.name}`
}

export function productPath(product: Pick<Product, 'id'>): string {
  return `/product/${product.id}`
}

const USER_RANKS: Record<User['badge'], { label: string; color: string }> = {
  'Cobre': { label: 'Cobre', color: 'var(--rank-cobre)' },
  'Prata': { label: 'Prata', color: 'var(--rank-prata)' },
  'Cobalto': { label: 'Cobalto', color: 'var(--rank-cobalto)' },
  'Esmeralda': { label: 'Esmeralda', color: 'var(--rank-esmeralda)' },
  'Platina': { label: 'Platina', color: 'var(--rank-platina)' },
  'Diamante': { label: 'Diamante', color: 'var(--rank-diamante)' },
}

// Patente desconhecida cai na primeira, para nunca quebrar a tela
export function userRank(user: Pick<User, 'badge'>) {
  return USER_RANKS[user.badge] ?? USER_RANKS['Cobre']
}

// Os três primeiros ranks não têm aura (brilho pulsante) em volta do emblema, igual aos SVGs
const RANKS_WITHOUT_AURA = new Set(['Cobre', 'Prata', 'Cobalto'])

/**
 * Contorno da foto: a escolha da pessoa (um rank já liberado ou 'founder') ou, sem escolha,
 * o automático: RGB para fundador, cor do rank atual para os outros.
 */
export function ringAppearance(ringStyle: string | null | undefined, rankName: string, isFounder: boolean) {
  if (ringStyle === 'founder' || (!ringStyle && isFounder)) return { founder: true, color: null }
  return { founder: false, color: userRank({ badge: (ringStyle || rankName) as User['badge'] }).color }
}

export function rankHasAura(rank: string) {
  return !RANKS_WITHOUT_AURA.has(rank)
}

export function profilePath(user: Pick<User, 'username'>): string {
  return `/profile/${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`
}

export function useScoreColor(score: number): string {
  if (score >= 9.0) return 'text-gear-green'
  if (score >= 7.5) return 'text-gear-gold'
  if (score >= 6.0) return 'text-gear-warn'
  return 'text-gear-red'
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(date)
}
