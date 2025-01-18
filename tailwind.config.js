/** @type {import('tailwindcss').Config} */
export default {
  content: ['./pages/**/*.{vue,js}', './components/**/*.{vue,js}'], // Tailwindが適用されるファイル
  theme: {
    extend: {}, // 必要であればここでカスタマイズ
  },
  plugins: [],
}