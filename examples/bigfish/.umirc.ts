export default {
  routes: [
    { path: '/', component: 'index', name: 'index' },
    { path: '/users', component: 'users', name: 'users' },
    {
      path: '/data-flow',
      component: 'users',
      name: 'data-flow',
      children: [
        {
          path: '/data-flow/use-model',
          component: 'use-model',
          name: 'use-model',
        },
      ],
    },
  ],
  antd: {
    // import: true,
    style: 'less',
    // dark: true,
  },
  // dva: {},
  model: {},
  analytics: {
    baidu: 'test',
  },
  moment2dayjs: {},
  layout: {},
};
