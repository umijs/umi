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
        path: '/list.html',
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
        path: '/detail.html',
        exact: true,
        component: 'pages/detail/page.js',
      },
      {
        path: '/index.html',
        exact: true,
        component: 'pages/index.js',
      },
      {
        path: '/users/list.html',
        exact: true,
        component: 'pages/users/list.js',
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

  it.only('variable path', () => {
    const config = getRouteConfig({
      cwd: join(fixture, 'variable-path'),
      absPagesPath: join(fixture, 'variable-path'),
    });
    console.log(config);
    expect(config).toEqual([
      {
        path: '/$userId.html',
        exact: true,
        component: '$userId/page.js',
      },
      {
        path: '/a.html',
        exact: true,
        component: 'a.js',
      },
    ]);
  });
});
