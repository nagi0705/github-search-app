// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css', '~/assets/css/custom.css'], // カスタムCSSを追加
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})