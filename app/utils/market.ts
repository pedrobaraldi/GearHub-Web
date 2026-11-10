// Tipos e formatação da aba Games (dados da Steam coletados pela API). Preços chegam em centavos.
export interface MarketGame {
  appid: number
  name: string
  headerImage: string | null
  genres: string[]
  free: boolean
  currency: string | null
  initialCents: number | null
  finalCents: number | null
  discountPercent: number
  currentPlayers: number | null
  peakPlayers24h: number | null
  reviewPercent: number | null
  lowestCents: number | null
  // Página do jogo no catálogo, quando já ligada
  slug: string | null
}

export interface MarketGameDetail {
  summary: MarketGame
  shortDescription: string | null
  developers: string | null
  releaseDate: string | null
  reviewPositive: number | null
  reviewNegative: number | null
  reviewSummary: string | null
  lowestAt: string | null
  peakPlayersAll: number | null
  trackedSince: string
  updatedAt: string | null
}

export interface MarketHistory {
  range: string
  prices: { takenAt: string, initialCents: number, finalCents: number, discountPercent: number }[]
  players: { takenAt: string, players: number }[]
}

export function formatPrice(cents: number | null | undefined, currency = 'BRL') {
  if (cents == null) return '—'
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency })
}

export function formatPlayers(value: number | null | undefined) {
  if (value == null) return '—'
  return value.toLocaleString('pt-BR')
}

// Preço do card: gratuito, sem preço na loja, ou o valor final
export function priceLabel(game: Pick<MarketGame, 'free' | 'finalCents' | 'currency'>) {
  if (game.free) return 'Gratuito'
  // Jogo que a Steam não vende avulso (lançadores, versões antigas): o preço está na página da loja
  if (game.finalCents == null) return 'Ver na loja'
  return formatPrice(game.finalCents, game.currency ?? 'BRL')
}
