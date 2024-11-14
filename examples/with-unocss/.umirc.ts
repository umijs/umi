export default {
  mako: {},
  plugins: [require.resolve('@umijs/plugins/dist/unocss')],
  unocss: {
    watch: ['pages/**/*.tsx'],
  },
};
