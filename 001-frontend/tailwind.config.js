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
          DEFAULT: '#76b900', // NVIDIA Green
          dark: '#5a8d00',
        },
        panel: {
          DEFAULT: '#111111',
          hover: '#1a1a1a',
        },
        hairline: {
          DEFAULT: '#333333',
          strong: '#5e5e5e',
        },
        status: {
          success: '#76b900',
          danger: '#e52020',
          warning: '#df6500',
          info: '#0046a4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'sm': '2px', // Angular NVIDIA style
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 5px var(--primary)' },
          '50%': { opacity: .7, boxShadow: '0 0 2px var(--primary)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        pulseGlow: 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
