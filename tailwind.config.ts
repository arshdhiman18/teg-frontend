import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4A978A',
          50: '#f0faf9',
          100: '#d3f0ec',
          200: '#a8e1da',
          300: '#6ecac0',
          400: '#4A978A',
          500: '#3a7d72',
          600: '#2f655c',
          700: '#28524a',
          800: '#22433d',
          900: '#1e3834',
        },
        dark: {
          DEFAULT: '#1F3D3A',
          light: '#2d5550',
          lighter: '#3a6e68',
        },
        light: {
          DEFAULT: '#F4F8F7',
          warm: '#faf7f2',
          cool: '#f0f5f4',
        },
        gold: {
          DEFAULT: '#C6A769',
          light: '#d4bc8a',
          dark: '#a8883f',
          pale: '#f5edd8',
        },
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        cormorant: ['var(--font-cormorant)', 'Cormorant Garamond', 'Georgia', 'serif'],
        inter: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out 1s infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-up': 'fadeUp 0.8s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gold-gradient': 'linear-gradient(135deg, #C6A769, #d4bc8a, #C6A769)',
      },
      boxShadow: {
        'luxury': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'luxury-hover': '0 16px 48px rgba(0, 0, 0, 0.12)',
        'gold': '0 0 0 2px rgba(198, 167, 105, 0.5)',
        'gold-glow': '0 8px 32px rgba(198, 167, 105, 0.2)',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#1F3D3A',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
