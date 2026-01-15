/** @type {import('tailwindcss').Config} */
// Tailwind CSS 4.0 설정
// CSS-first 접근 방식 사용 - src/index.css에서 설정

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
