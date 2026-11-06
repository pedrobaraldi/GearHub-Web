export interface User {
  id: string
  name: string
  username: string
  avatar: string
  badge: 'ExploradorPro' | 'Explorador' | 'Analista' | 'Reviewer' | 'Especialista' | 'Lenda'
  level: number
  pro?: boolean
  bio?: string
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
  ExploradorPro: { label: 'Explorador', color: 'var(--gear-text)' },
  Explorador: { label: 'Explorador', color: 'var(--gear-text)' },
  Analista: { label: 'Analista', color: 'var(--rank-analista)' },
  Reviewer: { label: 'Reviewer', color: 'var(--gear-green)' },
  Especialista: { label: 'Especialista', color: 'var(--gear-gold)' },
  Lenda: { label: 'Lenda', color: 'var(--rank-lenda)' },
}

export function userRank(user: Pick<User, 'badge'>) {
  return USER_RANKS[user.badge]
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
