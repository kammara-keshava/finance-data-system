/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Backgrounds ──────────────────────────────────────────────────────
        bg: {
          base:    '#0A0A0A',
          deep:    '#121212',
          surface: '#171717',
          raised:  '#1C1C1C',
          hover:   '#1F1F1F',
          input:   '#141414',
        },
        // ── Borders ──────────────────────────────────────────────────────────
        line: {
          DEFAULT: '#262626',
          subtle:  '#1F1F1F',
          strong:  '#3A3A3A',
        },
        // ── Text ─────────────────────────────────────────────────────────────
        ink: {
          primary:   '#F5F5F5',
          secondary: '#A1A1AA',
          muted:     '#737373',
          disabled:  '#525252',
        },
        // ── Gold — identity accent (limited use) ─────────────────────────────
        gold: {
          DEFAULT: '#D4AF37',
          dim:     '#B8960C',
          faint:   'rgba(212,175,55,0.12)',
          border:  'rgba(212,175,55,0.25)',
        },
        // ── Semantic ─────────────────────────────────────────────────────────
        success: '#22C55E',
        danger:  '#EF4444',
      },
      backgroundImage: {
        'page':        'linear-gradient(160deg, #0A0A0A 0%, #121212 100%)',
        'card':        'linear-gradient(160deg, #1C1C1C 0%, #171717 100%)',
        'card-income': 'linear-gradient(160deg, #1F1F1F 0%, #171717 100%)',
      },
      boxShadow: {
        'card':       '0 2px 16px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.4)',
        'card-hover': '0 6px 32px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.5)',
        'gold':       '0 0 12px rgba(212,175,55,0.18)',
        'danger':     '0 4px 16px rgba(239,68,68,0.25)',
      },
      animation: {
        'fade-in':  'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' },                                    to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(10px)' },     to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(12px)' },     to: { opacity: '1', transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
};
