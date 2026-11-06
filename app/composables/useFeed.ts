import type { Review, User } from '~/composables/useGearData'

export interface FeedAuthor {
  username: string
  displayName: string
  avatarUrl: string | null
  rankName: string
  level: number
  pro: boolean
}

export interface FeedItem {
  kind: 'review' | 'post'
  id: string
  author: FeedAuthor
  createdAt: string
  title: string | null
  body: string | null
  category: string | null
  likeCount: number
  commentCount: number
  product: { slug: string, name: string, brand: string, category: string, imageUrl: string | null } | null
  score: number | null
  coverUrl: string | null
  scores: { label: string, value: number }[]
  specs: { label: string, value: string }[]
  pros: string[]
  cons: string[]
  tags: string[]
  images: string[]
  likedByMe: boolean
  savedByMe: boolean
  mine: boolean
}

export interface FeedPage {
  items: FeedItem[]
  nextCursor: string | null
}

export function toUser(author: FeedAuthor): User {
  return {
    id: author.username,
    name: author.displayName,
    username: author.username,
    avatar: author.avatarUrl ?? '',
    badge: author.rankName as User['badge'],
    pro: author.pro,
    level: author.level,
  }
}

// Adapta a resposta da API ao formato que o ReviewCard já usa
export function toReview(item: FeedItem): Review {
  const product = item.product!
  return {
    id: item.id,
    user: toUser(item.author),
    date: item.createdAt,
    product: {
      id: product.slug,
      name: product.name,
      brand: product.brand,
      category: product.category as Review['product']['category'],
      image: item.coverUrl ?? product.imageUrl ?? undefined,
    },
    title: item.title ?? product.name,
    body: item.body ?? '',
    score: item.score ?? 0,
    unrated: item.score === null,
    subScores: item.scores,
    specs: item.specs,
    images: item.images,
    likedByMe: item.likedByMe,
    savedByMe: item.savedByMe,
    mine: item.mine,
    pros: item.pros,
    cons: item.cons,
    likes: item.likeCount,
    comments: item.commentCount,
    tags: [],
    type: 'review',
  }
}
