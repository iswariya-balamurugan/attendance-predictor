/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Taste Skill dark slate / zinc neutral palette
        slate: {
          950: '#090d16',
          900: '#0f172a',
          850: '#131d35',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
          100: '#f1f5f9',
          50: '#f8fafc',
        },
        // Taste Skill semantic statuses
        status: {
          cyan: {
            DEFAULT: '#06b6d4',
            light: '#22d3ee',
            dark: '#0891b2',
            subtle: 'rgba(6, 182, 212, 0.12)',
            border: 'rgba(6, 182, 212, 0.3)'
          },
          emerald: {
            DEFAULT: '#10b981',
            light: '#34d399',
            dark: '#059669',
            subtle: 'rgba(16, 185, 129, 0.12)',
            border: 'rgba(16, 185, 129, 0.3)'
          },
          amber: {
            DEFAULT: '#f59e0b',
            light: '#fbbf24',
            dark: '#d97706',
            subtle: 'rgba(245, 158, 11, 0.12)',
            border: 'rgba(245, 158, 11, 0.3)'
          },
          rose: {
            DEFAULT: '#f43f5e',
            light: '#fb7185',
            dark: '#e11d48',
            subtle: 'rgba(244, 63, 94, 0.12)',
            border: 'rgba(244, 63, 94, 0.3)'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      boxShadow: {
        'tactile': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.2)',
        'tactile-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        'subtle-border': 'inset 0 1px 0 rgba(255, 255, 255, 0.08)'
      }
    },
  },
  plugins: [],
}
