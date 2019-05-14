import routesToJSON from './routesToJSON';

const service = {
  config: {},
  paths: {
    cwd: '$CWD$',
    absSrcPath: '$SRC$',
    absTmpDirPath: '$CWD$/pages/.umi',
    tmpDirPath: './pages/.umi',
    absCompilingComponentPath: '$COMPILING$',
  },
};

describe('routesToJSON', () => {
  it('normal', () => {
    const json = routesToJSON([{ component: './pages/A' }], service, {});
    expect(JSON.parse(json)).toEqual([{ component: "require('../A').default" }]);
  });

  it('relative component path', () => {
    const json = routesToJSON(
      [
        { component: './pages/A' },
        { component: './pages/A/A' },
        { component: './A' },
        { component: './B/A' },
      ],
      service,
      {},
    );
    expect(JSON.parse(json)).toEqual([
      { component: "require('../A').default" },
      { component: "require('../A/A').default" },
      { component: "require('../../A').default" },
      { component: "require('../../B/A').default" },
    ]);
  });

  it('disable dynamicImport by default', () => {
    const json = routesToJSON([{ component: './pages/A' }], service, 'production');
    expect(JSON.parse(json)).toEqual([{ component: "require('../A').default" }]);
  });

  it('component with react function', () => {
    const json = routesToJSON([{ component: '() => A', path: '/a' }], service, {});
    expect(JSON.parse(json)).toEqual([{ component: '() => A', path: '/a' }]);
  });

  it('path with htmlSuffix', () => {
    const json = routesToJSON(
      [{ component: './pages/A', path: '/a(.html)?' }, { component: './pages/B', path: '/b' }],
      {
        ...service,
        config: { exportStatic: { htmlSuffix: true } },
      },
    );
    expect(JSON.parse(json)).toEqual([
      {
        component: "require('../A').default",
        path: '/a(.html)?',
      },
      {
        component: "require('../B').default",
        path: '/b',
      },
    ]);
  });

  it('applyPlugins', () => {
    let applyPluginName = null;
    let applyPluginOpts = null;
    let applied = false;
    const json = routesToJSON(
      [{ path: '/', component: './pages/A' }],
      {
        ...service,
        config: { react: { dynamicImport: true } },
        applyPlugins(name, opts) {
          applyPluginName = name;
          applyPluginOpts = opts;
          applied = true;
          return `${opts.initialValue}__Modified`;
        },
      },
      'production',
    );
    expect(JSON.parse(json)).toEqual([
      {
        path: '/',
        component: "require('../A').default__Modified",
      },
    ]);
    expect(applied).toEqual(true);
    expect(applyPluginName).toEqual('modifyRouteComponent');
    expect(applyPluginOpts).toEqual({
      initialValue: "require('../A').default",
      args: {
        importPath: '../A',
        webpackChunkName: 'p__A',
        component: './pages/A',
      },
    });
  });

  it('Routes', () => {
    const json = routesToJSON(
      [
        {
          Routes: ['./routes/A', './pages/.umi/B'],
        },
      ],
      service,
      {},
    );
    expect(JSON.parse(json)).toEqual([
      { Routes: "[require('../../routes/A').default, require('./B').default]" },
    ]);
  });

  it('Routes with winPath', () => {
    const json = routesToJSON([{ Routes: ['routes\\A'] }], service, {});
    expect(JSON.parse(json)).toEqual([{ Routes: "[require('../../routes/A').default]" }]);
  });
});
