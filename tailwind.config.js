/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rajdhani', 'sans-serif'],
        mono: ['Orbitron', 'monospace'],
      },
      colors: {
        'neon-blue': '#00d4ff',
        'neon-purple': '#9d4edd',
        'neon-pink': '#ff0080',
        'neon-green': '#00ff88',
        'dark-space': '#0a0a0a',
        'space-purple': '#1a0033',
        'cyber-grey': '#2a2a2a',
      },
      animation: {
        'hologram': 'hologram 3s ease-in-out infinite',
        'glitch': 'glitch 0.3s ease-in-out',
      },
      keyframes: {
        hologram: {
          '0%, 100%': { backgroundPosition: '0% 0%' },
          '50%': { backgroundPosition: '100% 100%' },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
      },
    },
  },
  plugins: [],
}
