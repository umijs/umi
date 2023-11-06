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
  },
  mf: {
    name: moduleFederationName,
    shared,
    library: { type: 'window', name: moduleFederationName },
  },
  publicPath: 'http://127.0.0.1:9000/',
  hash: false,
});
