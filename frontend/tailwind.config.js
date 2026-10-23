/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: '#E8B65A', bright: '#F5C876', deep: '#8B6914' },
        violet: '#8B5CF6',
        emerald: '#10B981',
        bg: { DEFAULT: '#0A0A0F', elev: '#12121A', card: '#17171F' },
        text: { DEFAULT: '#F5F5F7', muted: '#A1A1AA', dim: '#52525B' },
      },
      fontFamily: {
        sans: ['var(--font-satoshi)', 'system-ui', 'sans-serif'],
        display: ['var(--font-clash)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      boxShadow: {
        press: '0 4px 0 var(--gold-deep), 0 6px 10px rgba(0,0,0,.35)',
        card: '0 4px 12px rgba(0,0,0,.4)',
      },
    },
  },
  plugins: [],
};