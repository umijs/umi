import { defineConfig } from '@umijs/max';

export default defineConfig({
  routes: [
    {
      title: 'site.title',
      path: '/',
      icon: 'ic:baseline-14mp',
      component: 'index',
      name: 'index',
    },
    {
      path: '/users',
      icon: 'local:rice',
      component: 'users',
      name: 'users',
      wrappers: ['@/wrappers/foo', '@/wrappers/bar'],
    },
    {
      path: '/accessAllow',
      icon: 'SmileFilled',
      component: 'users',
      name: 'Allow',
      access: 'canReadFoo',
    },
    {
      path: '/accessDeny',
      icon: 'SmileFilled',
      component: 'users',
      name: 'Deny',
      access: 'canReadBar',
    },
    { path: '/app1/*', icon: 'SmileFilled', name: 'app1', microApp: 'app1' },
    {
      path: '/data-flow',
      component: 'data-flow',
      name: 'data-flow',
      icon: 'SmileFilled',
      routes: [
        {
          path: '/data-flow/use-model',
          component: 'use-model',
          name: 'use-model',
          icon: 'SwitcherFilled',
        },
        {
          path: '/data-flow/dva',
          component: 'dva',
          name: 'dva',
          icon: 'TagFilled',
        },
      ],
    },
    {
      path: '/history',
      component: 'history',
    },
  ],
  antd: {
    // import: true,
    style: 'less',
    // dark: true,
  },
  initialState: {
    loading: '@/components/Loading',
  },
  access: {},
  dva: {},
  model: {},
  analytics: {
    baidu: 'test',
  },
  moment2dayjs: {},
  mock: {
    include: ['pages/**/_mock.ts'],
  },
  layout: {
    title: 'Ant Design Pro',
  },
  mfsu: {
    // esbuild: true,
  },
  request: {},
  locale: {
    title: true,
  },
  qiankun: {
    master: {
      apps: [
        {
          name: 'app1',
          entry: '//localhost:8001/app1',
          props: {
            autoSetLoading: true,
          },
        },
      ],
    },
  },
  tailwindcss: {},
  // vite: {}
  // esmi: { cdnOrigin: 'https://npmcore-pre.alipay.com' },
  // lowImport: {},
  codeSplitting: {
    jsStrategy: 'granularChunks',
  },
  icons: {
    autoInstall: {},
    include: ['local:rice', 'local:logo/umi', 'ant-design:fire-twotone'],
  },
});
