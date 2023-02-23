import { join } from 'path';
import { componentToChunkName, getRoutes } from './routes';

const fixtures = join(__dirname, './fixtures/getRoutes');
const ABSOLUTE_PAGE_PATH = join(
  __dirname,
  './fixtures/getRoutes/pages/absolute.tsx',
);

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
          {
            path: '/absolute',
            component: ABSOLUTE_PAGE_PATH,
          },
        ],
      },
      userConfig: {},
      applyPlugins(opts: any) {
        return opts?.initialValue;
      },
    } as any,
  });

  // login 页不包含布局
  expect(routes[1].file).toBe('@/pages/users/Login/index.tsx');
  expect(routes[1].parentId).toBe(undefined);

  // @@/global-layout
  expect(routes['@@/global-layout'].file).toContain('layouts/index.tsx');
  expect(routes['@@/global-layout'].parentId).toBe(undefined);
  expect(routes['@@/global-layout'].isLayout).toBe(true);

  // 普通页面增加布局
  expect(routes[2].file).toBe('@/pages/404.tsx');
  expect(routes[2].parentId).toBe('@@/global-layout');

  // vue 文件测试
  expect(routes[3].file).toBe('@/pages/hello/index.vue');
  expect(routes[3].parentId).toBe('@@/global-layout');

  // resolve absolute path
  expect(routes[6].file).toBe(ABSOLUTE_PAGE_PATH);
  delete routes[6].file;

  // __absFile 是具体的路径, 快照测试通不过
  Object.keys(routes).forEach((id) => {
    delete routes[id].__absFile;
  });

  // 覆写 layout 的绝对路径地址，用于保持快照稳定
  routes['@@/global-layout'].file = '@/layouts/index.tsx';

  expect(routes).toMatchSnapshot();
});

test('componentToChunkName normal', () => {
  expect(componentToChunkName('@/pages/index.ts')).toEqual('p__index');

  expect(componentToChunkName('@/pages/index.tsx')).toEqual('p__index');

  expect(componentToChunkName('@/pages/index.jsx')).toEqual('p__index');

  expect(componentToChunkName('@/pages/index.js')).toEqual('p__index');

  expect(componentToChunkName('@/pages/users/[id].ts')).toEqual('p__users__id');

  expect(componentToChunkName('@/pages/users/[id].tsx')).toEqual(
    'p__users__id',
  );

  expect(componentToChunkName('@/pages/users/[id].js')).toEqual('p__users__id');

  expect(componentToChunkName('@/pages/users/[id].jsx')).toEqual(
    'p__users__id',
  );

  expect(componentToChunkName('@/pages/users/[id].vue')).toEqual(
    'p__users__id',
  );

  expect(componentToChunkName('@/components/404/index.tsx')).toEqual(
    'components__404__index',
  );

  expect(componentToChunkName('@/layouts/index.tsx')).toEqual('layouts__index');

  expect(
    componentToChunkName('@/.umi-production/plugin-layout/Layout.tsx'),
  ).toEqual('t__plugin-layout__Layout');
});

test('componentToChunkName cwd', () => {
  expect(
    componentToChunkName('/users/test/pages/users/[id].jsx', '/users/test'),
  ).toEqual('p__users__id');

  expect(
    componentToChunkName('/users/test/pages/users/[id].vue', '/users/test'),
  ).toEqual('p__users__id');
});

test('componentToChunkName cwd escape char', () => {
  expect(
    componentToChunkName('/users/c++/pages/users/[id].tsx', '/users/c++'),
  ).toEqual('p__users__id');
});
