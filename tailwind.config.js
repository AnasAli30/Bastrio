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
        primary: {
          light: '#3B82F6',
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
        },
        secondary: {
          light: '#6B7280',
          DEFAULT: '#4B5563',
          dark: '#374151',
        },
        background: {
          light: '#FFFFFF',
          DEFAULT: '#F3F4F6',
          dark: '#000000',
        },
        surface: {
          light: '#F9FAFB',
          DEFAULT: '#F3F4F6',
          dark: '#121212',
        },
        text: {
          light: '#111827',
          DEFAULT: '#374151',
          dark: '#E5E5E5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}

