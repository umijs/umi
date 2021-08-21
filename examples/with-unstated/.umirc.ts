import { defineConfig } from 'umi';

export default defineConfig({
  unstated: {
    global: ['global'],
  },
  publicPath: './',
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    { path: '/', component: '@/pages/index' },
  ],
  fastRefresh: {},
});
