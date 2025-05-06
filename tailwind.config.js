// ========================================================================
// FILE: tailwind.config.js
// ========================================================================
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // Сканируем все JS/JSX/TS/TSX файлы в src
  ],
  theme: {
    extend: {
      // Основная палитра
      colors: {
        "dark-bg": "#121212", // Еще темнее фон для контраста
        "card-bg": "#1E1E1E", // Фон карточек и элементов UI
        "primary-blue": "#007BFF", // Основной акцентный синий
        "gradient-blue": "#00C4FF", // Вторичный синий для градиентов
        "hover-blue": "#0056b3", // Синий для hover эффектов
        // Расширение стандартных цветов Tailwind
        gray: {
          900: "#111827", // Используется для фона, если dark-bg не задан
          800: "#1F2937", // Темно-серый для элементов UI
          700: "#374151", // Серый для границ, фона инпутов
          600: "#4B5563", // Серый для текста, границ
          500: "#6B7280", // Серый для второстепенного текста, иконок
          400: "#9CA3AF", // Светло-серый для текста
          300: "#D1D5DB", // Еще светлее
          200: "#E5E7EB", // Почти белый
          100: "#F3F4F6", // Очень светлый
        },
        // Можно добавить другие акцентные цвета
        // 'accent-green': '#10B981',
        // 'accent-red': '#EF4444',
        // 'accent-yellow': '#F59E0B',
      },
      // Шрифты
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          '"Noto Sans"',
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        // Можно добавить моноширинный шрифт
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          '"Courier New"',
          "monospace",
        ],
      },
      // Анимации
      animation: {
        // spin уже есть по умолчанию в Tailwind v3+
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      // Тени
      boxShadow: {
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        "inner-md": "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
        "blue-glow-sm":
          "0 1px 3px 0 rgba(0, 123, 255, 0.1), 0 1px 2px -1px rgba(0, 123, 255, 0.1)",
        "blue-glow-md":
          "0 4px 6px -1px rgba(0, 123, 255, 0.1), 0 2px 4px -2px rgba(0, 123, 255, 0.1)",
        "blue-glow-lg":
          "0 10px 15px -3px rgba(0, 123, 255, 0.1), 0 4px 6px -4px rgba(0, 123, 255, 0.1)",
      },
    },
  },
  plugins: [
    // Официальные плагины Tailwind
    require("@tailwindcss/forms"), // Стили для элементов форм по умолчанию
    require("@tailwindcss/typography"), // Стили для прозы (например, из Markdown)
    require("@tailwindcss/aspect-ratio"), // Для соотношения сторон
    require("@tailwindcss/line-clamp"), // Для обрезки текста по количеству строк
  ],
  // variants в Tailwind v3+ используются реже, предпочтительнее модификаторы (hover:, focus:, group-hover:)
  // Но если нужны специфичные варианты:
  variants: {
    extend: {
      // Пример:
      backgroundColor: ["active"],
      opacity: ["disabled"],
      cursor: ["disabled"],
    },
  },
};
