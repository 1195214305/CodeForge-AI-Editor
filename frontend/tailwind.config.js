/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 赛博朋克配色 - 避免蓝紫渐变
        cyber: {
          orange: '#ff6b35',
          cyan: '#00e5cc',
          pink: '#ff006e',
          yellow: '#ffbe0b',
        },
        // 暗黑主题
        dark: {
          bg: '#0a0a0f',
          surface: '#1a1a24',
          border: '#2a2a3a',
        }
      },
      backgroundImage: {
        'cyber-grid': "linear-gradient(rgba(0, 229, 204, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 204, 0.1) 1px, transparent 1px)",
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 229, 204, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 229, 204, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}
