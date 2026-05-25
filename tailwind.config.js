/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts,scss}"],
  theme: {
    extend: {
      colors: {
        "bg-base": "#212529",
        "bg-secondary": "#343a40",
        content: "#ced4da",
        "primary-green": "#76c893",
        "primary-red": "#d90429",
      },
    },
  },
  plugins: [],
  corePlugins: { preflight: false },
};
