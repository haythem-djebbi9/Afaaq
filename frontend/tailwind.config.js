export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        afaaq: {
          blue: '#0D47A1',
          'blue-700': '#1256BE',
          'blue-50': '#EAF1FB',
          'blue-900': '#0A3578',
          gold: '#FFC107',
          'gold-600': '#E5A800',
          'gold-50': '#FFF8E5',
        },
        surface: '#F2F4F7',
        ink: {
          900: '#111827',
          700: '#374151',
          500: '#6B7280',
          200: '#E5E7EB',
        },
      },
      fontFamily: {
        display: ['Montserrat', 'Cairo', 'system-ui', 'sans-serif'],
        body: ['Poppins', 'Cairo', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.04), 0 8px 24px rgba(16,24,40,0.06)',
        lift: '0 8px 32px rgba(13,71,161,0.14)',
      },
      maxWidth: {
        shell: '1440px',
      },
    },
  },
}
