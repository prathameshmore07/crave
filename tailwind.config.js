/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#E23744',
          hover: '#C41E3A',
          light: 'rgba(226,55,68,0.12)',
        },
        success: '#1BA672',
        surface: {
          DEFAULT: '#FFFFFF',
          raised: '#F9FAFB',
        },
        dark: {
          bg: '#111111',
          surface: '#1C1C1E',
          border: 'rgba(255,255,255,0.08)',
        },
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        caption: ['12px', { lineHeight: '16px', fontWeight: '500' }],
        sm: ['13px', { lineHeight: '18px' }],
        body: ['14px', { lineHeight: '20px' }],
        base: ['15px', { lineHeight: '22px' }],
        section: ['18px', { lineHeight: '24px' }],
        'section-lg': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        hero: ['24px', { lineHeight: '32px' }],
        'h1': ['28px', { lineHeight: '36px', fontWeight: '600', letterSpacing: '-0.5px' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderColor: {
        light: 'rgba(0,0,0,0.08)',
        'light-subtle': 'rgba(0,0,0,0.05)',
        'light-card': 'rgba(0,0,0,0.07)',
      },
      animation: {
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
      },
      keyframes: {
        skeleton: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
