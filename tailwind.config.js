/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 千问风格：浅色背景与层次
        surface: '#f5f5f7',
        'surface-elevated': '#ffffff',
        card: '#ffffff',
        'card-hover': '#fafafa',
        primary: '#1677ff',
        'primary-light': '#4096ff',
        accent: '#1677ff',
        'accent-soft': '#e6f4ff',
        muted: '#8c8c8c',
        'muted-light': '#bfbfbf',
        border: '#e8e8e8',
        success: '#52c41a',
        'success-soft': '#d9f7be',
        // 气泡与文字
        'bubble-user': '#1677ff',
        'bubble-assistant': '#ffffff',
        'text-primary': '#1f1f1f',
        'text-secondary': '#595959',
      },
      borderRadius: {
        'bubble': '20px',
        'card': '12px',
        'input': '22px',
      },
    },
  },
  plugins: [],
};
