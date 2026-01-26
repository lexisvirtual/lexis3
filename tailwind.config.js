export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lexisPurple: '#820AD1',
      },
      backgroundImage: {
        'mesh': "url('https://grainy-gradients.vercel.app/noise.svg')",
      },
    },
  },
  plugins: [],
}
