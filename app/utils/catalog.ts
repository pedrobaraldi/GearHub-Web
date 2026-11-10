import type { MarketGame } from '~/utils/market'

// Catálogo de jogos (dados do IGDB.com), no formato de /api/v1/catalog

export interface CatalogCard {
  slug: string
  name: string
  coverUrl: string | null
  year: number | null
  platforms: string[]
  rating: number | null
}

export interface CatalogGame {
  igdbId: number
  slug: string
  name: string
  type: string | null
  // Em inglês, como vem do IGDB
  summary: string | null
  storyline: string | null
  releaseDate: string | null
  coverUrl: string | null
  artworkUrl: string | null
  ratings: { critics: number | null, criticsCount: number | null, users: number | null, usersCount: number | null, total: number | null }
  // Horas
  timeToBeat: { main: number | null, extras: number | null, completionist: number | null, count: number } | null
  genres: string[]
  themes: string[]
  modes: string[]
  perspectives: string[]
  platforms: { name: string, abbreviation: string | null }[]
  developers: string[]
  publishers: string[]
  engines: string[]
  franchise: string | null
  screenshots: string[]
  videos: { name: string | null, youtubeId: string }[]
  portuguese: { audio: boolean, subtitles: boolean, interfaceText: boolean }
  multiplayer: { onlineMax: number | null, offlineMax: number | null, onlineCoop: boolean, offlineCoop: boolean, campaignCoop: boolean, lanCoop: boolean, splitscreen: boolean } | null
  // Classificação indicativa brasileira: L, 10, 12, 14, 16 ou 18
  ageRating: string | null
  hypes: number | null
  links: { label: string, url: string }[]
  dlcs: CatalogCard[]
  expansions: CatalogCard[]
  similar: CatalogCard[]
  steamAppid: number | null
  syncedAt: string
}

export interface CatalogGameResponse {
  game: CatalogGame
  steam: MarketGame | null
}

// Cores oficiais da classificação indicativa
const AGE_COLORS: Record<string, string> = {
  L: 'bg-[#0c9447] text-white',
  10: 'bg-[#0f7dc2] text-white',
  12: 'bg-[#f8c411] text-black',
  14: 'bg-[#e67824] text-white',
  16: 'bg-[#db2827] text-white',
  18: 'bg-black text-white border border-white/30',
}

export function ageRatingClass(rating: string) {
  return AGE_COLORS[rating] ?? 'bg-gear-surface text-gear-text'
}

// Português do Brasil: o que dá para dizer em uma linha
export function portugueseLabel(pt: CatalogGame['portuguese']) {
  if (pt.audio) return 'Dublado em português'
  if (pt.subtitles) return 'Legendado em português'
  if (pt.interfaceText) return 'Menus em português'
  return null
}

export function releaseLabel(date: string | null) {
  if (!date) return null
  return new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}
