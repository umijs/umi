import { defineConfig } from 'umi';

const tailwindPlugins = require('./tailwind.config.js');

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [{ path: '/', component: '@/pages/index' }],
  fastRefresh: {},
  extraPostCSSPlugins: tailwindPlugins.plugins,
});
