import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [{ path: '/', component: '@/pages/index' }],
  fastRefresh: {},
  extraPostCSSPlugins: [
    require('postcss-import'),
    require('tailwindcss')({
      purge: ['./src/**/*.html', './src/**/*.tsx', './src/**/*.jsx'],
    }),
    require('postcss-nested'),
  ],
});
