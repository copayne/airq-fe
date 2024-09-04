import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
      colors: {
        'default': {
          'dark': '#334538',
          'light': '#DCD3B8',
          'contrast': '#A45A52',
          'textLight': '#F5F1E4',
          'textDark': '#1A2520',
        },
        'status': {
          'good': '#32C487',
          'mid': '#E4E068',
          'bad': '#D05039',
        },
      },
      dropShadow: {
        'sticker': [
          '1px 0 1px rgba(0, 0, 0, .25)',
          '-1px 0 1px rgba(0, 0, 0, .25)',
        ],
      }
    },
  },
  plugins: [],
} satisfies Config;
