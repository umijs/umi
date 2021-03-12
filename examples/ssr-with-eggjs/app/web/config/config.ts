import { defineConfig } from 'umi';
import { join } from 'path';

const cwd = process.cwd();
const manifest = join(cwd, 'config/manifest.json');

export default defineConfig({
  ssr: {
    devServerRender: false,
  },
  hash: true,
  outputPath: '../public',
  manifest: {
    fileName: '../../config/manifest.json',
    // 为 ''，不然会有两个 /
    publicPath: '',
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
  routes: [{ path: '/', component: '@/pages/index' }],
});
