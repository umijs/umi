export default {
  routes: [
    { path: '/', component: 'index', name: 'index' },
    { path: '/users', component: 'users', name: 'users' },
    {
      path: '/data-flow',
      component: 'data-flow',
      name: 'data-flow',
      routes: [
        {
          path: '/data-flow/use-model',
          component: 'use-model',
          name: 'use-model',
        },
        {
          path: '/data-flow/dva',
          component: 'dva',
          name: 'dva',
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
  dva: {},
  model: {},
  analytics: {
    baidu: 'test',
  },
  moment2dayjs: {},
  layout: {},
};
