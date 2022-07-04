import { join } from 'path';
import { getRoutes } from './routes';

const fixtures = join(__dirname, './fixtures/getRoutes');

test('getRoutes', async () => {
  const routes = await getRoutes({
    api: {
      paths: {
        absSrcPath: fixtures,
        absPagesPath: join(fixtures, 'pages'),
      },
      config: {
        routes: [
          {
            id: 'login',
            path: '/login',
            layout: false,
            component: 'users/Login',
          },
          {
            path: '*',
            component: '404',
          },
          {
            path: '/hello',
            component: '@/pages/hello',
          },
          {
            path: '/users',
            component: '@/pages/users/index',
            routes: [
              {
                path: '/users/foo',
                component: './users/Foo',
              },
            ],
          },
        ],
      },
      applyPlugins(opts: any) {
        return opts?.initialValue;
      },
    } as any,
  });

  // login 页不包含布局
  expect(routes[1].file).toBe('@/pages/users/Login/index.tsx');
  expect(routes[1].parentId).toBe(undefined);

  // @@/global-layout
  expect(routes['@@/global-layout'].file).toBe('@/layouts/index.tsx');
  expect(routes['@@/global-layout'].parentId).toBe(undefined);
  expect(routes['@@/global-layout'].isLayout).toBe(true);

  // 普通页面增加布局
  expect(routes[2].file).toBe('@/pages/404.tsx');
  expect(routes[2].parentId).toBe('@@/global-layout');

  // vue 文件测试
  expect(routes[3].file).toBe('@/pages/hello/index.vue');
  expect(routes[3].parentId).toBe('@@/global-layout');

  // __absFile 是具体的路径, 快照测试通不过
  Object.keys(routes).forEach((id) => {
    delete routes[id].__absFile;
  });

  expect(routes).toMatchSnapshot();
});
