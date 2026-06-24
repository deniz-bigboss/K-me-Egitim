/* Tailwind CDN tema yapılandırması — tüm sayfalarda CDN scriptinden hemen sonra yüklenir */
/* Siyah-beyaz (monokrom) tema */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        /* Ana renk: gri tonları / siyah */
        brand: {
          50:  '#f7f7f7',
          100: '#ededed',
          200: '#d6d6d6',
          300: '#b5b5b5',
          400: '#909090',
          500: '#6e6e6e',
          600: '#4d4d4d',
          700: '#2e2e2e',
          800: '#1a1a1a',
          900: '#0a0a0a',
        },
        /* Vurgu: yine gri tonları (açık tonlar koyu zeminde, koyu tonlar açık zeminde okunur) */
        accent: {
          50:  '#f4f4f4',
          100: '#e6e6e6',
          200: '#cfcfcf',
          300: '#b0b0b0',
          400: '#9a9a9a',
          500: '#6b6b6b',
          600: '#3f3f3f',
          700: '#2b2b2b',
          800: '#1c1c1c',
          900: '#111111',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Sora"', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        '7xl': '80rem',
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(0, 0, 0, 0.18)',
        card: '0 12px 32px -16px rgba(0, 0, 0, 0.28)',
      },
    },
  },
};
