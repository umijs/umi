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

const moduleFederationName = 'remoteCounter';

export default defineConfig({
  mfsu: {
    strategy: 'eager',
    mfName: `mf_${moduleFederationName}`,
    remoteName: moduleFederationName,
    shared,
  },
  mf: {
    name: moduleFederationName,
    shared,
  },
  publicPath: 'http://127.0.0.1:9000/',
});
