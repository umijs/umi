import { ModuleFederationPlugin } from '@module-federation/enhanced/webpack';
import { defineConfig } from '@umijs/max';

const shared = {
  react: {
    singleton: true,
    eager: true,
  },
  'react-dom': {
    singleton: true,
    eager: true,
  },
};

export default defineConfig({
  mfsu: false,
  // mf: {
  //   name: 'remote',
  //   version: 'v2',
  //   shared,
  //   library: { type: 'window', name: 'remote' },
  // },
  publicPath: 'auto',
  esbuildMinifyIIFE: true,
  chainWebpack(memo) {
    memo.plugin('mf-v2').use(ModuleFederationPlugin, [
      {
        name: 'mf-v2-remote',
        filename: 'remote.js',
        exposes: {
          // 设置需要导出的模块，default 导出为 .
          './Counter': './src/exposes/Counter',
        },
        shared,
        library: { type: 'window', name: 'remote' },
      },
    ]);
  },
});
