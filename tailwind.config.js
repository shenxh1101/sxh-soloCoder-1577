/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#FDF8F5',
          100: '#FAEDE8',
          200: '#F5D5CD',
          300: '#EEB6A8',
          400: '#E8A5A5',
          500: '#D88585',
          600: '#C06B6B',
          700: '#A35252',
          800: '#874141',
          900: '#6E3535',
        },
        sage: {
          50: '#F5F8F3',
          100: '#E6EFE2',
          200: '#CDDFC6',
          300: '#ABC8A0',
          400: '#A8C5A0',
          500: '#7FA874',
          600: '#638B59',
          700: '#506E48',
          800: '#42583C',
          900: '#374932',
        },
        cream: '#FDF8F5',
        cocoa: {
          50: '#F7F3F0',
          100: '#EBE1DB',
          200: '#D7C4B9',
          300: '#BFA08F',
          400: '#A37D68',
          500: '#8B6550',
          600: '#775343',
          700: '#634337',
          800: '#5C4A42',
          900: '#4A3A33',
        },
      },
      fontFamily: {
        display: ['"Noto Serif SC"', 'serif'],
        body: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(139, 101, 80, 0.08)',
        'soft-lg': '0 8px 30px rgba(139, 101, 80, 0.12)',
        'card': '0 2px 12px rgba(92, 74, 66, 0.06)',
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'fadeIn': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slideUp': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
