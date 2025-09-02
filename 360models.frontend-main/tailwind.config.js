/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
    screens: {
      xxs: "300px",
      xs: "425px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "4xl": "2560px",
      msm: { max: "640px" },
      mmd: { max: "768px" },
      mlg: { max: "1024px" },
      mxl: { max: "1280px" },
      m2xl: { max: "1536px" },
    },
  },
};
