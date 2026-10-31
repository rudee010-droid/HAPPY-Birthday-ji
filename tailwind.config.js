/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        blush: '#FFD9E8',
        'hot-pink': '#FF4F86',
        lavender: '#B79CFF',
        peach: '#FFC9A8',
        cream: '#FFF3C4',
        plum: '#3D1D3A',
        midnight: '#14102E',
        antares: '#FF3D6E'
      },
      fontFamily: {
        display: ['Pacifico', 'cursive'],
        body: ['Fredoka', 'sans-serif']
      },
      borderRadius: {
        'glass': '28px',
        'card': '24px'
      },
      boxShadow: {
        'glow-pink': '0 0 30px rgba(255, 79, 134, 0.35)',
        'glow-lavender': '0 0 30px rgba(183, 156, 255, 0.35)',
        'glow-cream': '0 0 25px rgba(255, 243, 196, 0.4)',
        'glass': '0 8px 32px 0 rgba(20, 16, 46, 0.37)'
      }
    },
  },
  plugins: [],
}

