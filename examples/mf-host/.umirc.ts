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
  mfsu: {
    remoteName: 'hostUser',
    remoteAliases: ['remoteCounter'],
    shared,
  },
  mf: {
    name: 'hostUser',
    remotes: [
      {
        name: 'remoteCounter',
        entry: 'http://127.0.0.1:8001/remote.js',
      },
    ],
    shared,
  },
});
