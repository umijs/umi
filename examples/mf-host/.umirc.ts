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
  mf: {
    name: 'hostUser',
    remotes: [
      {
        name: 'remoteCounter',
        entries: {
          DEV: 'http://127.0.0.1:9000/remote.js',
          PROD: 'https://production.com/remote.js',
        },
        keyResolver: `(()=> 'DEV')()`,
      },
      {
        aliasName: 'utopia',
        name: 'notExist',
        entry: 'http://1.2.3.4:404/bad_file.js',
      },
    ],
    shared,
  },
});
