import { IConfig } from '@umijs/types';

export default {
  ssr: {},
  exportStatic: {},
  routes: [{ path: '/', component: 'index' }],
  alias: {
    'react-router': require.resolve('react-router/cjs/react-router.js'),
  },
} as IConfig;
