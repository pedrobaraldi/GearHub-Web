export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
  ],
  css: ['~/assets/css/main.css'],
  // Mesma origem para o navegador: sem CORS, e o cookie de sessão funciona também no SSR
  routeRules: {
    '/api/**': { proxy: `${process.env.NUXT_API_URL ?? 'http://localhost:8080'}/api/**` },
    '/uploads/**': { proxy: `${process.env.NUXT_API_URL ?? 'http://localhost:8080'}/uploads/**` },
  },
  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
    },
  },
  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'dark',
  },
})
