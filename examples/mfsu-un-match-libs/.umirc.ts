export default {
  npmClient: 'pnpm',
  crossorigin: {},
  presets: [require.resolve('@umijs/preset-vue')],
  polyfill: false,
  plugins: [require.resolve('@umijs/plugins/dist/tailwindcss')],
  tailwindcss: {},
  extraBabelPlugins: [
    [
      'import',
      {
        libraryName: 'vant',
        libraryDirectory: 'es',
        style: true,
      },
    ],
  ],
  extraBabelIncludes: ['vant'],
  mfsu: {
    exclude: [/^vant/],
  },
};
