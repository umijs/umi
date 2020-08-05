import { defineConfig } from 'umi';

export default defineConfig({
  ssr: {
    devServerRender: false,
  },
  locale: {
    default: 'zh-CN',
    antd: false,
    title: false,
    baseNavigator: true,
    baseSeparator: '-',
  },
  dva: {
    immer: true,
    // hmr: false,
  },
  nodeModulesTransform: {
    type: 'none',
  },
  outputPath: '../public/',
  routes: [{ path: '/', component: '@/pages/index' }],
});
