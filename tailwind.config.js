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
        'web3-primary': '#6366f1',
        'web3-secondary': '#8b5cf6',
        'web3-accent': '#06b6d4',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    // @tailwindcss/line-clamp is now included by default in Tailwind CSS v3.3+
    // require('@tailwindcss/line-clamp'), // Removed as it's now built-in
  ],
}