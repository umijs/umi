import { defineConfig, IConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
{{ ^conventionRoutes }}
  routes: [
    { path: '/', component: '@/pages/index' },
  ],
{{ /conventionRoutes }}
  fastRefresh: {},
}  as IConfig);
