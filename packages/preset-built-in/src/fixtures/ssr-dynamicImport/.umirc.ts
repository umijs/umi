import { IConfig } from '@umijs/types';

export default {
  ssr: {},
  history: { type: 'memory' },
  routes: [
    { path: '/bar', component: 'Bar' },
    { path: '/', component: 'index' },
  ],
  mountElementId: '',
} as IConfig;
