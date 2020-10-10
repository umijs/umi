import { defineConfig } from 'umi';

export default defineConfig({
  ssr: {},
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    {
      path: '/',
      component: '@/layouts/index',
      routes: [
        {
          path: '/',
          component: '@/pages/index',
        },
        {
          path: '/about',
          component: '@/pages/about',
        },
      ],
    },
  ],
});
