import { defineConfig } from 'umi';

export default defineConfig({
{{ ^convensionRoutes }}
  routes: [
    { path: '/', component: '@/pages/index' },
  ],
{{ /convensionRoutes }}
});
