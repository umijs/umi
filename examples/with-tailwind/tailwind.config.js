module.exports = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss')({
      purge: ['./src/**/*.html', './src/**/*.tsx', './src/**/*.jsx'],
    }),
    require('postcss-nested'),
  ],
};
