/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF4F7A',
          dark: '#D64062',
          light: '#FF9AB3',
        },
        secondary: {
          DEFAULT: '#1F8BFF',
          dark: '#126ACE',
          light: '#87C6FF',
        },
        accent: '#F9B84D',
        ink: '#1A1D29',
        canvas: '#F6F7FB',
        success: '#26D07C',
        error: '#FF4757',
        warning: '#FF9F43',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        heading: ['Sora', 'sans-serif'],
        accent: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF4F7A 0%, #F9B84D 52%, #1F8BFF 100%)',
        'gradient-soft': 'radial-gradient(circle at 15% 10%, rgba(255,79,122,0.18) 0%, rgba(255,79,122,0) 44%), radial-gradient(circle at 85% 12%, rgba(31,139,255,0.16) 0%, rgba(31,139,255,0) 42%), linear-gradient(180deg, #FDFEFF 0%, #F6F7FB 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(14,21,46,0) 0%, rgba(14,21,46,0.72) 100%)',
      },
      boxShadow: {
        glow: '0 10px 30px rgba(255, 79, 122, 0.25)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
