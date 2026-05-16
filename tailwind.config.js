/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./node_modules/@bbhhainx/chat-core/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      borderRadius: {
        '2.5xl': '20px',
      },
      fontSize: {
        'xxs': '0.625rem', // Tương đương 10px
        'xs-': '0.6875rem', // Tương đương 11px
        'sm-': '0.8125rem', // Tương đương 13px
      },
      spacing: {
        '1.25': '0.3125rem',  // Tương đương 5px
        '1/2': '50%', // Thêm giá trị 50% vào thang đo spacing
      },
      lineHeight: {
        '4.5': '1.125rem', // Tương đương 18px
      },
      screens: {
        'lg+': '1200px',
      },
    }
  },
  plugins: [
    function ({ addUtilities, addBase }) {
      // tạo class custom
      addUtilities({
        '.webkit-box': { display: '-webkit-box' },
      })
      // reset css
      addBase({
        'button': { '@apply focus:outline-none hover:brightness-90 disabled:opacity-50': {} },
        'a': { '@apply underline text-blue-700 hover:brightness-90 disabled:opacity-50': {} },
      })
    },
  ],
}
