import { IConfig } from '@umijs/types';

export default {
  ssr: {},
  history: { type: 'memory' },
  routes: [{ path: '/', component: 'index' }],
  nodeModulesTransform: {
    type: 'none',
  },
  mountElementId: '',
} as IConfig;
