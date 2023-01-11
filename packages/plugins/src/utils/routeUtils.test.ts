import { deepFilterLeafRoutes } from '../../libs/qiankun/master/routeUtils';

test('deepFilterLeafRoutes is ok', () => {
  const input = [
    {
      path: '/',
      component: '@/layouts/index.tsx',
      children: [
        {
          path: '/app1',
          component: '@/pages/app1/index.tsx',
          children: [
            // 配置微应用 app1 关联的路由
            {
              // 带上 * 通配符意味着将 /app1/project 下所有子路由都关联给微应用 app1
              path: '/app1/project/*',
              microApp: 'app1',
              children: [],
            },
          ],
        },
        // 配置 app2 关联的路由
        {
          path: '/app2/*',
          microApp: 'app2',
          children: [],
        },
      ],
    },
  ];

  const res = [
    {
      path: '/app1/project/*',
      microApp: 'app1',
      children: [],
    },
    {
      path: '/app2/*',
      microApp: 'app2',
      children: [],
    },
  ];

  expect(deepFilterLeafRoutes(input)).toHaveLength(2);
  expect(deepFilterLeafRoutes(input)).toEqual(res);
});
