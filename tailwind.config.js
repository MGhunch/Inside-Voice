/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#00CEB4',
          dark: '#04342C',
        },
        gold: {
          DEFAULT: '#FEC514',
          dark: '#412402',
          muted: '#BA7517',
        },
        purple: {
          DEFAULT: '#584E9F',
        },
        gray: {
          light: '#E8E8EC',
          bg: '#fafafa',
        },
      },
      fontFamily: {
        heading: ['Outfit', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
