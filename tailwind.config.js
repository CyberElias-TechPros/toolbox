/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        indigo: {
          50: '#fff4ee',
          100: '#ffe4d6',
          200: '#ffc8ac',
          300: '#f8a277',
          400: '#f28556',
          500: '#ed713c',
          600: '#d95828',
          700: '#b8451e',
          800: '#963a21',
          900: '#73301f',
          950: '#411b12',
        },
        zinc: {
          50: '#f8f8f5',
          100: '#f0f0eb',
          200: '#e5e5dd',
          300: '#d1d1c6',
          400: '#9d9f94',
          500: '#777a70',
          600: '#5b5f54',
          700: '#41463c',
          800: '#2c3229',
          900: '#20271f',
          950: '#151b15',
        },
      },
      fontFamily: {
        sans: [
          'DM Sans Variable',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'monospace',
        ],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 4px 16px -4px rgb(0 0 0 / 0.08)',
        'card-hover': '0 2px 4px 0 rgb(0 0 0 / 0.05), 0 12px 28px -8px rgb(0 0 0 / 0.16)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.18s ease-out',
      },
    },
  },
  plugins: [],
};
