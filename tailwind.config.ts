import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import typography from "@tailwindcss/typography";

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
          'background': 'rgb(var(--airq-bg) / <alpha-value>)',
          'dark': 'rgb(var(--airq-dark) / <alpha-value>)',
          'light': 'rgb(var(--airq-light) / <alpha-value>)',
          'primary': 'rgb(var(--airq-primary) / <alpha-value>)',
          'secondary': 'rgb(var(--airq-secondary) / <alpha-value>)',
          'tertiary': 'rgb(var(--airq-tertiary) / <alpha-value>)',
          'contrast': 'rgb(var(--airq-contrast) / <alpha-value>)',
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
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'data-stream': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '0% 100%' },
        },
        'status-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.2s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan-line': 'scan-line 3s linear infinite',
        'data-stream': 'data-stream 8s linear infinite',
        'status-pulse': 'status-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [typography],
} satisfies Config;
