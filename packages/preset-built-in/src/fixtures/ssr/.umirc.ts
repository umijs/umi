import { IConfig } from '@umijs/types';

export default {
  ssr: {},
  history: { type: 'memory' },
  routes: [
    { path: '/', component: 'index' },
    { path: '/getInitialPropsParams', component: 'getInitialPropsParams' },
  ],
  mountElementId: '',
} as IConfig;
