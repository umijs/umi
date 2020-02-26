import { defineConfig } from 'umi';

export default defineConfig({
{{ ^conventionRoutes }}
  routes: [
    { path: '/', component: '@/pages/index' },
  ],
{{ /conventionRoutes }}
});
