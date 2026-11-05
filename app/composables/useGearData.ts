export interface User {
  id: string
  name: string
  username: string
  avatar: string
  badge: 'ExploradorPro' | 'Explorador' | 'Especialista' | 'Reviewer'
  level: number
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

export type Category =
  | 'Todos'
  | 'CPU'
  | 'GPU'
  | 'Headset'
  | 'Microfone'
  | 'Monitor'
  | 'Mouse'
  | 'Mousepad'
  | 'Notebook'
  | 'SSD'
  | 'Teclado'
  | 'Webcam'

export const CATEGORIES: Category[] = [
  'Todos',
  'CPU',
  'GPU',
  'Headset',
  'Microfone',
  'Monitor',
  'Mouse',
  'Mousepad',
  'Notebook',
  'SSD',
  'Teclado',
  'Webcam',
]

export const CATEGORY_ICONS: Record<Category, string> = {
  Todos: 'grid',
  CPU: 'cpu',
  GPU: 'monitor-smartphone',
  Headset: 'headphones',
  Microfone: 'mic',
  Monitor: 'monitor',
  Mouse: 'mouse-pointer-2',
  Mousepad: 'square',
  Notebook: 'laptop',
  SSD: 'hard-drive',
  Teclado: 'keyboard',
  Webcam: 'camera',
}

export const FEED_FILTERS = [
  { label: 'Todos', value: 'todos' },
  { label: 'Reviews', value: 'review' },
  { label: 'Posts', value: 'post' },
]

const UNSPLASH_MOUSE = 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1200&q=80'
const UNSPLASH_KEYBOARD = 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&q=80'
const UNSPLASH_HEADSET = 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&q=80'
const UNSPLASH_MOUSEPAD = 'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=1200&q=80'

export function useMockReviews(): Review[] {
  return [
    {
      id: '1',
      user: { id: 'u1', name: 'Thiago Valdez', username: 'thiago_v', avatar: 'https://i.pravatar.cc/40?img=1', badge: 'ExploradorPro', level: 42 },
      date: '2024-01-15',
      product: { id: 'p1', name: 'G Pro X Superlight 2', brand: 'Logitech', category: 'Mouse', image: UNSPLASH_MOUSE },
      title: 'O mouse definitivo para FPS competitivo',
      body: 'Depois de mais de 3 meses usando, posso afirmar que o Superlight 2 redefine o padrão para mouses wireless. O sensor HERO 2 é absolutamente sem latência perceptível e a vida útil da bateria surpreende em mais de 70 horas.',
      score: 9.4,
      subScores: [
        { label: 'Construção', value: 9.0 },
        { label: 'Ergonomia', value: 10.0 },
        { label: 'Sensor', value: 10.0 },
        { label: 'Botões', value: 8.0 },
      ],
      pros: ['Formato universal', 'Sensor Hero 2 impecável', 'Bateria absurda'],
      cons: ['Preço alto', 'Clique um pouco duro', 'Sem RGB (para quem gosta)'],
      likes: 234,
      comments: 47,
      tags: ['FPS', 'Wireless', 'Competitivo'],
      type: 'review',
    },
    {
      id: '2',
      user: { id: 'u2', name: 'Nayara HZ', username: 'nayara_hz', avatar: 'https://i.pravatar.cc/40?img=5', badge: 'Especialista', level: 38 },
      date: '2024-01-14',
      product: { id: 'p2', name: 'Maya X', brand: 'Lamzu', category: 'Mouse', image: UNSPLASH_MOUSE },
      title: 'Lamzu Maya X: o dark horse dos mouses',
      body: 'A Lamzu surpreende com o Maya X, combinando sensor PAW3395 com um shape simétrico extremamente confortável. Para jogadores ambidestros, não existe alternativa melhor no mercado.',
      score: 9.3,
      subScores: [
        { label: 'Construção', value: 9.0 },
        { label: 'Ergonomia', value: 9.5 },
        { label: 'Sensor', value: 9.6 },
        { label: 'Botões', value: 9.2 },
      ],
      pros: ['Shape simétrico premium', 'Sensor PAW3395 de topo', 'Cliques tácteis satisfatórios'],
      cons: ['Marca pouco conhecida no Brasil', 'Software básico'],
      likes: 189,
      comments: 32,
      tags: ['Ambidestro', 'Sensor', 'Custo-benefício'],
      type: 'review',
    },
    {
      id: '3',
      user: { id: 'u3', name: 'Pedro LM', username: 'pedro_lm', avatar: 'https://i.pravatar.cc/40?img=12', badge: 'ExploradorPro', level: 55, bio: 'Pro player Valorant. Deuses da precisão.' },
      date: '2024-01-13',
      product: { id: 'p3', name: 'Viper V3 Pro', brand: 'Razer', category: 'Mouse', image: UNSPLASH_MOUSE },
      title: 'Razer acerta em cheio com o Viper V3 Pro',
      body: 'A Razer voltou com tudo no segmento wireless. O Viper V3 Pro é a resposta direta ao G Pro X Superlight 2, com sensor Focus Pro de nova geração e construção levíssima. Para FPS competitivo é top de linha.',
      score: 9.6,
      subScores: [
        { label: 'Construção', value: 9.4 },
        { label: 'Ergonomia', value: 9.7 },
        { label: 'Sensor', value: 9.8 },
        { label: 'Botões', value: 9.5 },
      ],
      pros: ['Sensor Focus Pro 35K perfeito', 'Shape ergonômico para destros', 'Bateria longa'],
      cons: ['Mais caro que concorrentes', 'Sem versão ambidestra'],
      likes: 412,
      comments: 89,
      tags: ['FPS', 'Wireless', 'Premium'],
      type: 'review',
    },
    {
      id: '4',
      user: { id: 'u4', name: 'Mariana Eng.', username: 'mariana_eng', avatar: 'https://i.pravatar.cc/40?img=25', badge: 'ExploradorPro', level: 61 },
      date: '2024-01-12',
      product: { id: 'p4', name: 'Wooting 60HE+', brand: 'Wooting', category: 'Teclado', image: UNSPLASH_KEYBOARD },
      title: 'O teclado que mudou o meta dos shooters',
      body: 'Rapid Trigger mudou tudo. Depois de usar o Wooting 60HE+, qualquer outro teclado parece uma limitação artificial. Para counterstrafing e movimentação precisa em FPS, não tem paralelo.',
      score: 9.5,
      subScores: [
        { label: 'Switches', value: 9.8 },
        { label: 'Build Quality', value: 9.2 },
        { label: 'Software', value: 9.5 },
        { label: 'Latência', value: 9.9 },
      ],
      pros: ['Rapid Trigger revolucionário', 'Lekker switches magnéticos', 'Software Wootility completo'],
      cons: ['Apenas 60% pode limitar usuários', 'Preço alto para o tamanho'],
      likes: 567,
      comments: 134,
      tags: ['Rapid Trigger', 'FPS', 'Hall Effect'],
      type: 'review',
    },
    {
      id: '5',
      user: { id: 'u5', name: 'Julia HP', username: 'julia_hp', avatar: 'https://i.pravatar.cc/40?img=47', badge: 'Especialista', level: 44 },
      date: '2024-01-11',
      product: { id: 'p5', name: 'Wooting 80HE', brand: 'Wooting', category: 'Teclado', image: UNSPLASH_KEYBOARD },
      title: 'Wooting 80HE: Rapid Trigger com mais teclas',
      body: 'O irmão maior do 60HE+ traz o mesmo sistema magnético Lekker para um layout 80%, adicionando numpad parcial e cluster de navegação. Ideal para quem quer RT sem abrir mão de teclas funcionais.',
      score: 9.6,
      subScores: [
        { label: 'Switches', value: 9.8 },
        { label: 'Build Quality', value: 9.4 },
        { label: 'Software', value: 9.5 },
        { label: 'Latência', value: 9.9 },
      ],
      pros: ['Melhor dos dois mundos em layout', 'Lekker 2.0 mais suave', 'Placa alu premium'],
      cons: ['Preço mais elevado que o 60HE+', 'Escasso no estoque'],
      likes: 445,
      comments: 98,
      tags: ['80%', 'Rapid Trigger', 'Premium'],
      type: 'review',
    },
    {
      id: '6',
      user: { id: 'u6', name: 'Ana Flex', username: 'ana_flex', avatar: 'https://i.pravatar.cc/40?img=32', badge: 'Reviewer', level: 50 },
      date: '2024-01-10',
      product: { id: 'p6', name: 'Maxwell', brand: 'Audeze', category: 'Headset', image: UNSPLASH_HEADSET },
      title: 'Audeze Maxwell: o endgame dos headsets sem fio',
      body: 'Os drivers planares magnéticos da Audeze chegam ao mundo dos headsets wireless com o Maxwell. A qualidade de áudio é absurdamente superior a qualquer headset dinâmico, e o microfone removível impressiona.',
      score: 9.6,
      subScores: [
        { label: 'Áudio', value: 9.9 },
        { label: 'Microfone', value: 9.4 },
        { label: 'Build Quality', value: 9.5 },
        { label: 'Conforto', value: 9.3 },
      ],
      pros: ['Drivers planares insuperáveis', 'Wireless 2.4GHz e Bluetooth', 'Mic removível de qualidade'],
      cons: ['Peso de 490g', 'App só funciona em Windows'],
      likes: 378,
      comments: 76,
      tags: ['Wireless', 'Planar', 'Premium', 'Áudio'],
      type: 'review',
    },
  ]
}

export function useMockProducts(): Product[] {
  return [
    { id: 'p5', name: 'Wooting 80HE', brand: 'Wooting', category: 'Teclado', score: 9.7, reviewCount: 2, rank: 1, image: UNSPLASH_KEYBOARD },
    { id: 'p3', name: 'Viper V3 Pro', brand: 'Razer', category: 'Mouse', score: 9.6, reviewCount: 2, rank: 2, image: UNSPLASH_MOUSE },
    { id: 'p6', name: 'Maxwell', brand: 'Audeze', category: 'Headset', score: 9.6, reviewCount: 2, rank: 3, image: UNSPLASH_HEADSET },
    { id: 'p7', name: 'Zero XSOFT', brand: 'Artisan', category: 'Mousepad', score: 9.5, reviewCount: 1, rank: 4, image: UNSPLASH_MOUSEPAD },
    { id: 'p8', name: 'Q1 HE', brand: 'Keychron', category: 'Teclado', score: 9.4, reviewCount: 1, rank: 5, image: UNSPLASH_KEYBOARD },
    { id: 'p9', name: 'Hayate Otsu', brand: 'Artisan', category: 'Mousepad', score: 9.4, reviewCount: 1, rank: 6, image: UNSPLASH_MOUSEPAD },
    { id: 'p4', name: 'Wooting 60HE+', brand: 'Wooting', category: 'Teclado', score: 9.3, reviewCount: 2, rank: 7, image: UNSPLASH_KEYBOARD },
    { id: 'p2', name: 'Maya X', brand: 'Lamzu', category: 'Mouse', score: 9.2, reviewCount: 2, rank: 8, image: UNSPLASH_MOUSE },
    { id: 'p10', name: 'Saturn Pro', brand: 'LGG', category: 'Mousepad', score: 9.0, reviewCount: 1, rank: 9, image: UNSPLASH_MOUSEPAD },
    { id: 'p11', name: 'RTX 4090 FE', brand: 'NVIDIA', category: 'GPU', score: 9.0, reviewCount: 1, rank: 10 },
    { id: 'p12', name: 'Cloud III', brand: 'HyperX', category: 'Headset', score: 8.8, reviewCount: 1, rank: 11, image: UNSPLASH_HEADSET },
    { id: 'p13', name: 'A75', brand: 'DrunkDeer', category: 'Teclado', score: 8.7, reviewCount: 1, rank: 12, image: UNSPLASH_KEYBOARD },
    {
      id: 'p1',
      name: 'G Pro X Superlight 2',
      brand: 'Logitech',
      category: 'Mouse',
      score: 8.3,
      reviewCount: 3,
      rank: 13,
      image: UNSPLASH_MOUSE,
      about: 'Mouse ultraleve sem fio com sensor HERO 2.',
      specs: [
        { label: 'Peso', value: '60g' },
        { label: 'Sensor', value: 'HERO 2' },
        { label: 'Conectividade', value: 'LIGHTSPEED' },
      ],
    },
    { id: 'p14', name: 'WH-1000XM5', brand: 'Sony', category: 'Headset', score: 7.5, reviewCount: 1, rank: 14, image: UNSPLASH_HEADSET },
    { id: 'p15', name: 'Ryzen 9 7950X3D', brand: 'AMD', category: 'CPU', score: 7.0, reviewCount: 1, rank: 15 },
  ]
}

export function useAvailableCategories(): Category[] {
  const products = useMockProducts()
  return CATEGORIES.filter(c => c === 'Todos' || products.some(p => p.category === c))
}

export function productPath(product: Pick<Product, 'brand' | 'name'>): string {
  const slug = `${product.brand} ${product.name}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `/product/${slug}`
}

const USER_RANKS: Record<User['badge'], { label: string; color: string }> = {
  ExploradorPro: { label: 'Explorador', color: 'var(--gear-text)' },
  Explorador: { label: 'Explorador', color: 'var(--gear-text)' },
  Especialista: { label: 'Especialista', color: 'var(--gear-gold)' },
  Reviewer: { label: 'Reviewer', color: 'var(--gear-green)' },
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
