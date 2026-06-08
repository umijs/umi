module.exports = {
  plugins: [
    {
      postcssPlugin: 'utoopack-postcss-runtime-marker',
      Declaration(decl) {
        if (
          decl.prop === 'color' &&
          decl.value.replace(/\s+/g, ' ') === 'rgb(255, 0, 0)'
        ) {
          decl.value = 'rgb(1, 2, 3)';
        }
      },
    },
  ],
};
