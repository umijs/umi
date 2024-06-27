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
  mf: {
    name: 'remote',
    version: 'v2',
    shared,
    library: { type: 'window', name: 'remote' },
  },
  publicPath: 'auto',
  esbuildMinifyIIFE: true,
});
