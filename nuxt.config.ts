export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
    'nuxt-security',
  ],
  css: ['~/assets/css/main.css', '~/assets/css/rank-up.css'],
  runtimeConfig: {
    // Endereço da API Java (NUXT_API_URL em produção)
    apiUrl: 'http://localhost:8080',
    // Proteção contra robôs e excesso de requisições (server/middleware/0.shield.ts)
    shield: {
      // true só atrás de um proxy confiável (Cloudflare, balanceador): aí o IP real vem do cabeçalho dele
      trustProxy: false,
      requestsPerMinute: 600,
    },
    public: {
      // Chave pública do Turnstile. Vazia, a tela não mostra a verificação
      turnstileSiteKey: '0x4AAAAAAF1lwLseSJJP2mYi',
    },
  },
  // /api e /uploads chegam à API pelas rotas de server/routes, depois da barreira do shield.
  // Mesma origem para o navegador: sem CORS, e o cookie de sessão funciona também no SSR
  routeRules: {
    // A antiga aba /mercado virou /games: links salvos e compartilhados continuam funcionando
    '/mercado': { redirect: { to: '/games', statusCode: 301 } },
    // A página de segurança virou uma seção das Configurações
    '/seguranca': { redirect: { to: '/configuracoes#seguranca', statusCode: 301 } },
    '/mercado/**': { redirect: { to: '/games/steam/**', statusCode: 301 } },
  },
  // Cabeçalhos de segurança e CSP com nonce (nuxt-security). Limite de requisições e robôs ficam no shield
  security: {
    headers: {
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'base-uri': ["'none'"],
        'object-src': ["'none'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        'script-src-attr': ["'none'"],
        // Nonce: só os scripts que o próprio servidor colocou na página rodam
        'script-src': ["'self'", "'strict-dynamic'", "'nonce-{{nonce}}'", 'https://challenges.cloudflare.com'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
        'img-src': [
          "'self'", 'data:', 'blob:',
          'https://images.igdb.com', 'https://*.steamstatic.com', 'https://i.ytimg.com',
          'https://images.unsplash.com', 'https://i.pravatar.cc',
        ],
        'connect-src': ["'self'", 'https://challenges.cloudflare.com'],
        'frame-src': ['https://challenges.cloudflare.com', 'https://www.youtube-nocookie.com'],
        'worker-src': ["'self'", 'blob:'],
        'manifest-src': ["'self'"],
        'upgrade-insecure-requests': true,
      },
      // Imagens de fora (IGDB, Steam) e o trailer do YouTube precisam carregar
      crossOriginEmbedderPolicy: 'unsafe-none',
      // O player do YouTube recusa tocar sem o referrer
      referrerPolicy: 'strict-origin-when-cross-origin',
      xFrameOptions: 'DENY',
      strictTransportSecurity: { maxAge: 31536000, includeSubdomains: true },
      permissionsPolicy: {
        'camera': [],
        'microphone': [],
        'geolocation': [],
        'payment': [],
        'usb': [],
        'display-capture': [],
        'fullscreen': ['self', '"https://www.youtube-nocookie.com"'],
      },
    },
    // O limite por IP é o do shield, que sabe achar o IP real atrás de proxy
    rateLimiter: false,
    // Posts e comentários podem ter "<" e ">" de verdade: o Vue já escapa o que exibe
    xssValidator: false,
  },
  // Em desenvolvimento (http://localhost): sem forçar https e com o recarregamento do Vite
  $development: {
    security: {
      headers: {
        strictTransportSecurity: false,
        contentSecurityPolicy: {
          'upgrade-insecure-requests': false,
          'connect-src': ["'self'", 'https://challenges.cloudflare.com', 'ws:', 'wss:'],
        },
      },
    },
  },
  app: {
    head: {
      // cover: o conteúdo usa a tela inteira, e as margens seguras ficam com o CSS
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      meta: [
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'GearHub' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
      ],
    },
  },
  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'dark',
  },
})
