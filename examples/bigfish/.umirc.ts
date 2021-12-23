export default {
  routes: [
    { path: '/', icon: 'PlaySquareFilled', component: 'index', name: 'index' },
    { path: '/users', icon: 'SmileFilled', component: 'users', name: 'users' },
    {
      path: '/data-flow',
      component: 'data-flow',
      name: 'data-flow',
      icon: 'StarFilled',
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
  ],
  antd: {
    // import: true,
    style: 'less',
    // dark: true,
  },
  initialState: {},
  access: {},
  dva: {},
  model: {},
  analytics: {
    baidu: 'test',
  },
  moment2dayjs: {},
  layout: {
    name: 'Ant Design Pro',
  },
  mfsu: { esbuild: true },
  request: {},
};
