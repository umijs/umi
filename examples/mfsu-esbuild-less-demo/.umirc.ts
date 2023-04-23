import { dirname } from 'path';

export default {
  mfsu: {
    esbuild: true,
  },
  alias: {
    '@example/x-design': dirname(
      require.resolve('@example/x-design/package.json'),
    ),
    antd: dirname(require.resolve('antd/package.json')),
  },
};
