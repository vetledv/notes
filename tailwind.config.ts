import { Config } from "tailwindcss"

const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      transitionProperty: {
        width: 'width',
      },
    },
    keyframes: {
      shimmer: {
        '100%': {
          transform: 'translateX(100%)',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
export default config