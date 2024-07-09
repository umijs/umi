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
  chainWebpack(memo) {
    memo.plugin('mf-v2').use(ModuleFederationPlugin, [
      {
        name: 'mf-v2-host',
        remotes: {
          remote: 'remote@http://localhost:8010/mf-manifest.json',
        },
        shared,
      },
    ]);
  },
});
