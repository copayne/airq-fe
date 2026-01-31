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
          'contrast': '#3B68AC',
          'textLight': '#F5F1E4',
          'textDark': '#1A2520',
        },
        'airq': {
          'background': '#999',
          'dark': '#28262C',
          'light': '#F3F4FF',
          'primary': '#137547',
          'secondary': '#FFC914',
          'tertiary': '#ED4C4C',
          'contrast': '#2E2EAB',
        },
      },
      boxShadow: {
        'card': '3px 3px 0 0 rgba(0, 0, 0, 1)',
      },
      dropShadow: {
        'sticker': [
          '1px 0 1px rgba(0, 0, 0, .25)',
          '-1px 0 1px rgba(0, 0, 0, .25)',
        ],
      },
      height: {
        'full-no-header': 'calc(100vh - 64px)',
      },
      maxHeight: {
        'no-header': 'calc(100% - 64px)',
      },
      fontSize: {
        'xxs': '10px',
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
