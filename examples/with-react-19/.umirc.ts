export default {
  plugins: ['@umijs/plugins/dist/initial-state', '@umijs/plugins/dist/model'],
  routes: [{ path: '/', component: 'index' }],
  npmClient: 'pnpm',
  forget: {},
  initialState: {},
  model: {},
  mfsu: false,
};
