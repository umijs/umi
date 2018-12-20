exports.plugins = [];
exports.routes = [
  {
    path: '/aa',
    component: 'aa',
    routes: [
      {
        path: '/aa/vv',
        name: 'dd',
        component: 'adad', // 注释2
      },
      {
        path: '/aa/xx',
        name: 'xx',
        component: 'xx',
        routes: [
          {
            path: '/aa/xx/sdad', //注释3
            name: 'aada',
            component: 'xxx',
            routes: [
              {
                name: 'hehe',
                path: 'xxxcc',
              },
            ],
          },
          {
            path: 'aa',
            name: 'aadsda',
            component: 'xxxc',
          },
        ],
      },
    ],
  },
  {
    path: '/bb',
    component: 'bb',
  },
  {
    path: '/',
    component: '../MainLayout',
    childRoutes: [
      {
        path: 'test1',
        component: './test1',
      },
    ],
  },
];
