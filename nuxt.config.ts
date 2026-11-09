export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
  ],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      // Chave pública do Turnstile. Vazia, a tela não mostra a verificação
      turnstileSiteKey: '0x4AAAAAAF1lwLseSJJP2mYi',
    },
  },
  // Mesma origem para o navegador: sem CORS, e o cookie de sessão funciona também no SSR
  routeRules: {
    // manual: o retorno do Google e do Discord é um 302 com o cookie de sessão, que precisa chegar ao navegador
    '/api/**': {
      proxy: {
        to: `${process.env.NUXT_API_URL ?? 'http://localhost:8080'}/api/**`,
        fetchOptions: { redirect: 'manual' },
      },
    },
    '/uploads/**': { proxy: `${process.env.NUXT_API_URL ?? 'http://localhost:8080'}/uploads/**` },
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
