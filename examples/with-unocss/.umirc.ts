export default {
  plugins: [require.resolve('@umijs/plugins/dist/unocss')],
  unocss: {
    watch: ['pages/**/*.tsx'],
  },
};
