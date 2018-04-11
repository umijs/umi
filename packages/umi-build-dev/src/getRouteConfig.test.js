import { join } from 'path';
import getRouteConfig from './getRouteConfig';

const fixture = join(__dirname, '../test/fixtures/getRouteConfig');

describe('getRouteConfig', () => {
  it('routes via config', () => {
    const config = getRouteConfig({
      cwd: join(fixture, 'routes-via-config'),
    });
    expect(config).toEqual([
      {
        path: '/',
        exact: true,
        component: './pages/a',
      },
      {
        path: '/list',
        exact: true,
        component: './pages/b',
      },
    ]);
  });

  it('normal', () => {
    const config = getRouteConfig({
      cwd: join(fixture, 'normal'),
      absPagesPath: join(fixture, 'normal', 'pages'),
    });
    expect(config).toEqual([
      {
        path: '/',
        exact: true,
        component: './pages/index.js',
      },
      {
        path: '/detail',
        exact: true,
        component: './pages/detail/page.js',
      },
      {
        path: '/users/list',
        exact: true,
        component: './pages/users/list.js',
      },
    ]);
  });

  it('index directory', () => {
    const config = getRouteConfig({
      cwd: join(fixture, 'index-directory'),
      absPagesPath: join(fixture, 'index-directory', 'pages'),
    });
    expect(config).toEqual([
      {
        path: '/list',
        exact: true,
        component: './pages/list/page.js',
      },
      {
        path: '/',
        exact: true,
        component: './pages/index/page.js',
      },
    ]);
  });

  it('conflicts', () => {
    expect(() => {
      getRouteConfig({
        cwd: join(fixture, 'conflicts'),
        absPagesPath: join(fixture, 'conflicts'),
      });
    }).toThrow(/路由冲突/);
  });

  it('variable path', () => {
    const config = getRouteConfig({
      cwd: join(fixture, 'variable-path'),
      absPagesPath: join(fixture, 'variable-path'),
    });
    expect(config).toEqual([
      {
        path: '/a',
        exact: true,
        component: './a.js',
      },
      {
        path: '/:postId/',
        exact: true,
        component: './$postId/index.js',
      },
      {
        path: '/:userId',
        exact: true,
        component: './$userId/page.js',
      },
    ]);
  });

  it('throw error when variable path with exportStatic', () => {
    expect(() => {
      getRouteConfig(
        {
          cwd: join(fixture, 'variable-path'),
          absPagesPath: join(fixture, 'variable-path'),
        },
        {
          exportStatic: {},
        },
      );
    }).toThrow(/Variable path/);
  });

  it('nested routes', () => {
    const config = getRouteConfig({
      cwd: join(fixture, 'nested-routes'),
      absPagesPath: join(fixture, 'nested-routes'),
    });
    expect(config).toEqual([
      {
        path: '/list',
        exact: false,
        component: './list/_layout.js',
        routes: [
          { path: '/list/', exact: true, component: './list/index.js' },
          { path: '/list/b', exact: true, component: './list/b.js' },
        ],
      },
      { path: '/a', exact: true, component: './a.js' },
    ]);
  });
});
