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
    name: 'host',
    version: 'v2',
    remotes: [
      {
        name: 'remote',
        entry: 'http://localhost:8001/mf-manifest.json',
      },
    ],
    shared,
  },
});
