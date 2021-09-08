import { IConfig } from '@umijs/types';

export default {
  ssr: {
    prerender: false,
    removeWindowInitialProps: false
  },
  exportStatic: {},
  routes: [{ path: '/', component: 'index' }],
} as IConfig;
