import { join } from 'path';
import getRoute from './getRouteConfigFromDir';

describe('getRouteConfigFromDir', () => {
  it('normal', () => {
    const routes = getRoute({
      cwd: join(__dirname, 'fixtures', 'normal'),
      absPagesPath: join(__dirname, 'fixtures', 'normal'),
    });
    expect(routes).toEqual([
      { path: '/a', exact: true, component: './a.js' },
      { path: '/b', exact: true, component: './b.js' },
      { path: '/c/c', exact: true, component: './c/c.js' },
    ]);
  });

  it('file config', () => {
    const routes = getRoute({
      cwd: join(__dirname, 'fixtures', 'file-config'),
      absPagesPath: join(__dirname, 'fixtures', 'file-config'),
    });
    expect(routes).toEqual([
      { path: '/a', exact: true, component: './a.js', title: 'a' },
      { path: '/b', exact: true, component: './b.js', title: 'b' },
      { path: '/c/c', exact: true, component: './c/c.js', title: ['c', 'd'] },
    ]);
  });

  it('file config unexpected key', () => {
    expect(() => {
      getRoute({
        cwd: join(__dirname, 'fixtures', 'file-config-unexpected-key'),
        absPagesPath: join(__dirname, 'fixtures', 'file-config-unexpected-key'),
      });
    }).toThrowError(/Unexpected key/);
  });

  it('index/index', () => {
    const routes = getRoute({
      cwd: join(__dirname, 'fixtures', 'index-index'),
      absPagesPath: join(__dirname, 'fixtures', 'index-index'),
    });
    expect(routes).toEqual([{ path: '/', exact: true, component: './index/index.js' }]);
  });

  it('remove last index', () => {
    const routes = getRoute({
      cwd: join(__dirname, 'fixtures', 'remove-last-index'),
      absPagesPath: join(__dirname, 'fixtures', 'remove-last-index'),
    });
    expect(routes).toEqual([
      { path: '/a/a', exact: true, component: './a/a/index.js' },
      { path: '/a', exact: true, component: './a/index.js' },
      { path: '/', exact: true, component: './index.js' },
    ]);
  });

  it('ignore files', () => {
    const routes = getRoute({
      cwd: join(__dirname, 'fixtures', 'ignore-files'),
      absPagesPath: join(__dirname, 'fixtures', 'ignore-files'),
    });
    expect(routes).toEqual([{ path: '/a', exact: true, component: './a.js' }]);
  });

  it('multiple dynamic route error', () => {
    expect(() => {
      getRoute({
        cwd: join(__dirname, 'fixtures', 'multiple-dynamic-route-error'),
        absPagesPath: join(__dirname, 'fixtures', 'multiple-dynamic-route-error'),
      });
    }).toThrow(/We should not have multiple dynamic routes under a directory./);
  });

  it('optional route', () => {
    const routes = getRoute({
      cwd: join(__dirname, 'fixtures', 'optional-route'),
      absPagesPath: join(__dirname, 'fixtures', 'optional-route'),
    });
    expect(routes).toEqual([
      { path: '/a?', exact: true, component: './a$.js' },
      { path: '/c?/c', exact: true, component: './c$/c.js' },
      { path: '/:b?', exact: true, component: './$b$.js' },
    ]);
  });

  it('dynamic route order', () => {
    const routes = getRoute({
      cwd: join(__dirname, 'fixtures', 'dynamic-route-order'),
      absPagesPath: join(__dirname, 'fixtures', 'dynamic-route-order'),
    });
    expect(routes).toEqual([
      { path: '/a', exact: true, component: './a.js' },
      { path: '/c/a', exact: true, component: './c/a.js' },
      { path: '/c/d', exact: true, component: './c/d.js' },
      { path: '/c/:c', exact: true, component: './c/$c.js' },
      {
        path: '/e',
        exact: false,
        component: './e/_layout.js',
        routes: [
          { path: '/e/a', exact: true, component: './e/a.js' },
          { path: '/e/d', exact: true, component: './e/d.js' },
          { path: '/e/:c', exact: true, component: './e/$c.js' },
        ],
      },
      { path: '/:b', exact: true, component: './$b.js' },
    ]);
  });

  it('index layout order', () => {
    const routes = getRoute({
      cwd: join(__dirname, 'fixtures', 'index-layout-order'),
      absPagesPath: join(__dirname, 'fixtures', 'index-layout-order'),
    });
    expect(routes).toEqual([
      { path: '/list', exact: true, component: './list.js' },
      {
        path: '/',
        exact: false,
        component: './index/_layout.js',
        routes: [{ path: '/', exact: true, component: './index/index.js' }],
      },
    ]);
  });

  it('layout', () => {
    const routes = getRoute({
      cwd: join(__dirname, 'fixtures', 'layout'),
      absPagesPath: join(__dirname, 'fixtures', 'layout'),
    });
    expect(routes).toEqual([
      {
        path: '/a',
        exact: false,
        component: './a/_layout.js',
        routes: [{ path: '/a/a', exact: true, component: './a/a.js' }],
      },
    ]);
  });

  it('global layout', () => {
    const routes = getRoute({
      cwd: join(__dirname, 'fixtures', 'global-layout'),
      absPagesPath: join(__dirname, 'fixtures', 'global-layout'),
      absSrcPath: join(__dirname, 'fixtures', 'global-layout', '_src'),
    });
    expect(routes).toEqual([
      {
        path: '/',
        component: './_src/layouts/index.js',
        routes: [{ path: '/a', exact: true, component: './a.js' }],
      },
    ]);
  });

  it('global layout (sigular)', () => {
    const routes = getRoute({
      cwd: join(__dirname, 'fixtures', 'global-layout-sigular'),
      absPagesPath: join(__dirname, 'fixtures', 'global-layout-sigular'),
      absSrcPath: join(__dirname, 'fixtures', 'global-layout-sigular', '_src'),
    });
    expect(routes).toEqual([
      {
        path: '/',
        component: './_src/layout/index.js',
        routes: [{ path: '/a', exact: true, component: './a.js' }],
      },
    ]);
  });

  it('global layout not found', () => {
    const routes = getRoute({
      cwd: join(__dirname, 'fixtures', 'global-layout-not-found'),
      absPagesPath: join(__dirname, 'fixtures', 'global-layout-not-found'),
      absSrcPath: join(__dirname, 'fixtures', 'global-layout-not-found', '_src'),
    });
    expect(routes).toEqual([{ path: '/a', exact: true, component: './a.js' }]);
  });

  xit('route directory', () => {
    const routes = getRoute({
      cwd: join(__dirname, 'fixtures', 'route-directory'),
      absPagesPath: join(__dirname, 'fixtures', 'route-directory'),
    });
    expect(routes).toEqual([{ path: '/a', exact: true, component: './a/page.js' }]);
  });

  xit('throw error when route directory conflict', () => {
    expect(() => {
      getRoute({
        cwd: join(__dirname, 'fixtures', 'route-directory-conflict'),
        absPagesPath: join(__dirname, 'fixtures', 'route-directory-conflict'),
      });
    }).toThrowError(/Routes conflict/);
  });

  it('throw error when have root _layout.js', () => {
    expect(() => {
      getRoute({
        cwd: join(__dirname, 'fixtures', 'root-layout'),
        absPagesPath: join(__dirname, 'fixtures', 'root-layout'),
      });
    }).toThrowError(/root _layout.js is not supported/);
  });
});
