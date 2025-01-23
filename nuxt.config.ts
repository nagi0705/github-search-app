// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/color-mode', '@nuxtjs/color-mode'],
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/icon?family=Material+Icons',
        },
      ],
    },
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css', '~/assets/css/custom.css'], // カスタムCSSを追加
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  build: {
    transpile: ['naive-ui'],
  },
})