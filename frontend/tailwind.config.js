/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ai-blue': '#0066cc',
        'ai-purple': '#6366f1',
        'ai-green': '#10b981',
        'ai-red': '#ef4444',
      },
      fontFamily: {
        mono: ['Fira Code', 'Monaco', 'Consolas', 'Ubuntu Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
