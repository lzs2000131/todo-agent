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
          DEFAULT: '#6366F1',
          light: '#818CF8',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        bg: {
          primary: '#F8FAFC',
          card: '#FFFFFF',
        },
        text: {
          primary: '#1E293B',
          secondary: '#64748B',
        },
      },
    },
  },
  plugins: [],
}
