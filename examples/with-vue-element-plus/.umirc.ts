export default {
  deadCode: {},
  npmClient: 'pnpm',
  crossorigin: {},
  presets: [require.resolve('@umijs/preset-vue')],
  polyfill: false,
  routes: [
    {
      path: '/',
      component: 'index',
    },
    {
      path: '/table',
      component: 'Table',
    },
  ],
  vite: {},
};
