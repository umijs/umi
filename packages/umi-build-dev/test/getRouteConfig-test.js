import expect from 'expect';
import { join } from 'path';
import getRouteConfig from '../src/getRouteConfig';

const fixture = join(__dirname, 'fixtures/getRouteConfig');

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
        path: '/detail',
        exact: true,
        component: './pages/detail/page.js',
      },
      {
        path: '/',
        exact: true,
        component: './pages/index.js',
      },
      {
        path: '/users/list',
        exact: true,
        component: './pages/users/list.js',
      },
    ]);
  });

  it('normal with html suffix', () => {
    const config = getRouteConfig(
      {
        cwd: join(fixture, 'normal'),
        absPagesPath: join(fixture, 'normal', 'pages'),
      },
      {
        exportStatic: {
          htmlSuffix: true,
        },
      },
    );
    expect(config).toEqual([
      {
        path: '/detail.html',
        exact: true,
        component: './pages/detail/page.js',
      },
      {
        path: '/',
        exact: true,
        component: './pages/index.js',
      },
      {
        path: '/users/list.html',
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
        path: '/',
        exact: true,
        component: './pages/index/page.js',
      },
      {
        path: '/list',
        exact: true,
        component: './pages/list/page.js',
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
        path: '/:userId',
        exact: true,
        component: './$userId/page.js',
      },
      {
        path: '/a',
        exact: true,
        component: './a.js',
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
});
