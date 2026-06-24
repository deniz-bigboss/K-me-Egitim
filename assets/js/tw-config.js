/* Tailwind CDN tema yapılandırması — tüm sayfalarda CDN scriptinden hemen sonra yüklenir */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef3fc',
          100: '#d6e1f7',
          200: '#aec3ef',
          300: '#7f9fe3',
          400: '#5179d4',
          500: '#2f59c0',
          600: '#1f44a3',
          700: '#1a3784',
          800: '#16306d',
          900: '#0e1f48',
        },
        accent: {
          50:  '#fff8eb',
          100: '#feedc7',
          200: '#fdd98a',
          300: '#fbc14d',
          400: '#f9a826',
          500: '#e98c0b',
          600: '#cb6d06',
          700: '#a44e09',
          800: '#853e0f',
          900: '#6f3410',
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
        soft: '0 10px 40px -12px rgba(14, 31, 72, 0.18)',
        card: '0 12px 32px -16px rgba(14, 31, 72, 0.25)',
      },
    },
  },
};
