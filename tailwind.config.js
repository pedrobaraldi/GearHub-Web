// As cores vêm de variáveis CSS (ver main.css), trocadas pelo tema claro/escuro.
// color-mix mantém os modificadores de opacidade, ex.: bg-gear-primary/10.
const token = name => `color-mix(in srgb, var(--gear-${name}) calc(<alpha-value> * 100%), transparent)`

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  // No toque, o hover ficaria preso no último item tocado
  future: { hoverOnlyWhenSupported: true },
  content: [
    './app/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        gear: Object.fromEntries([
          'bg', 'sidebar', 'card', 'surface', 'border',
          'primary', 'primary-hover', 'on-primary', 'accent',
          'gold', 'warn', 'green', 'red',
          'muted', 'text', 'text-secondary',
        ].map(name => [name, token(name)])),
      },
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Barlow Condensed', 'Geist', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
