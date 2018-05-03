import expect from 'expect';
import { join } from 'path';
import FilesGenerator from './FilesGenerator';

xdescribe('FilesGenerator (getRoutesJSON)', () => {
  it('normal', () => {
    const service = {
      routes: [
        {
          path: '/a',
          component: './a.js',
        },
      ],
      paths: {
        absSrcPath: join(__dirname, '../test/fixtures/FilesGenerator/normal'),
        tmpDirPath: '.umi',
      },
      config: {},
      applyPlugins: (key, { initialValue }) => initialValue,
    };
    const fg = new FilesGenerator(service);
    const routesJSON = fg
      .getRoutesJSON()
      .replace(new RegExp(process.cwd(), 'g'), '<%= cwd %>');
    expect(JSON.parse(routesJSON)).toEqual([
      {
        component:
          "require('<%= cwd %>/packages/umi-build-dev/src/DefaultLayout.js').default",
        routes: [
          {
            path: '/a',
            component:
              "dynamic(() => import(/* webpackChunkName: a */'../a.js'), {})",
          },
        ],
      },
    ]);
  });

  it('with layout', () => {
    const service = {
      routes: [
        {
          path: '/a',
          component: './a.js',
        },
      ],
      paths: {
        absSrcPath: join(
          __dirname,
          '../test/fixtures/FilesGenerator/with-layouts',
        ),
        tmpDirPath: '.umi',
      },
      config: {},
      applyPlugins: (key, { initialValue }) => initialValue,
    };
    const fg = new FilesGenerator(service);
    const routesJSON = fg
      .getRoutesJSON()
      .replace(new RegExp(process.cwd(), 'g'), '<%= cwd %>');
    expect(JSON.parse(routesJSON)).toEqual([
      {
        component:
          "require('<%= cwd %>/packages/umi-build-dev/test/fixtures/FilesGenerator/with-layouts/layouts/index.js').default",
        routes: [
          {
            path: '/a',
            component:
              "dynamic(() => import(/* webpackChunkName: a */'../a.js'), {})",
          },
        ],
      },
    ]);
  });

  it('nested components', () => {
    const service = {
      routes: [
        {
          path: '/a',
          component: './a.js',
        },
        {
          path: '/list',
          component: './list/layout.js',
          routes: [
            {
              path: '/list/',
              component: './list/index.js',
            },
            {
              path: '/list/list',
              component: './list/list.js',
            },
          ],
        },
      ],
      paths: {
        absSrcPath: join(__dirname, '../test/fixtures/FilesGenerator/normal'),
        tmpDirPath: '.umi',
      },
      config: {},
      applyPlugins: (key, { initialValue }) => initialValue,
    };
    const fg = new FilesGenerator(service);
    const routesJSON = fg
      .getRoutesJSON()
      .replace(new RegExp(process.cwd(), 'g'), '<%= cwd %>');
    expect(JSON.parse(routesJSON)).toEqual([
      {
        component:
          "require('<%= cwd %>/packages/umi-build-dev/src/DefaultLayout.js').default",
        routes: [
          {
            path: '/a',
            component:
              "dynamic(() => import(/* webpackChunkName: a */'../a.js'), {})",
          },
          {
            path: '/list',
            component:
              "dynamic(() => import(/* webpackChunkName: list__layout */'../list/layout.js'), {})",
            routes: [
              {
                path: '/list/',
                component:
                  "dynamic(() => import(/* webpackChunkName: list__layout */'../list/index.js'), {})",
              },
              {
                path: '/list/list',
                component:
                  "dynamic(() => import(/* webpackChunkName: list__layout */'../list/list.js'), {})",
              },
            ],
          },
        ],
      },
    ]);
  });

  it('nested components development', () => {
    const service = {
      routes: [
        {
          path: '/a',
          component: './a.js',
        },
        {
          path: '/list',
          component: './list/layout.js',
          routes: [
            {
              path: '/list/',
              component: './list/index.js',
            },
            {
              path: '/list/list',
              component: './list/list.js',
            },
          ],
        },
      ],
      paths: {
        absSrcPath: join(__dirname, '../test/fixtures/FilesGenerator/normal'),
        tmpDirPath: '.umi',
      },
      config: {},
      applyPlugins: (key, { initialValue }) => initialValue,
    };
    const fg = new FilesGenerator(service);
    const routesJSON = fg
      .getRoutesJSON({
        env: 'development',
      })
      .replace(new RegExp(process.cwd(), 'g'), '<%= cwd %>');
    expect(JSON.parse(routesJSON)).toEqual([
      {
        component:
          "require('<%= cwd %>/packages/umi-build-dev/src/DefaultLayout.js').default",
        routes: [
          {
            path: '/a',
            component:
              "() => React.createElement(require('<%= cwd %>/packages/umi-build-dev/src/Compiling.js').default, { route: '/a' })",
          },
          {
            path: '/list',
            component:
              "() => React.createElement(require('<%= cwd %>/packages/umi-build-dev/src/Compiling.js').default, { route: '/list' })",
            routes: [
              {
                path: '/list/',
                component:
                  "() => React.createElement(require('<%= cwd %>/packages/umi-build-dev/src/Compiling.js').default, { route: '/list/' })",
              },
              {
                path: '/list/list',
                component:
                  "() => React.createElement(require('<%= cwd %>/packages/umi-build-dev/src/Compiling.js').default, { route: '/list/list' })",
              },
            ],
          },
        ],
      },
    ]);
  });

  it('nested components development with requested object', () => {
    const service = {
      routes: [
        {
          path: '/a',
          exact: true,
          component: './a.js',
        },
        {
          path: '/list',
          component: './list/layout.js',
          routes: [
            {
              path: '/list/',
              exact: true,
              component: './list/index.js',
            },
            {
              path: '/list/list',
              exact: true,
              component: './list/list.js',
            },
          ],
        },
      ],
      paths: {
        absSrcPath: join(__dirname, '../test/fixtures/FilesGenerator/normal'),
        tmpDirPath: '.umi',
      },
      config: {},
      applyPlugins: (key, { initialValue }) => initialValue,
    };
    const fg = new FilesGenerator(service);
    const routesJSON = fg
      .getRoutesJSON({
        env: 'development',
        requested: {
          '/list/list': 1,
        },
      })
      .replace(new RegExp(process.cwd(), 'g'), '<%= cwd %>');
    expect(JSON.parse(routesJSON)).toEqual([
      {
        component:
          "require('<%= cwd %>/packages/umi-build-dev/src/DefaultLayout.js').default",
        routes: [
          {
            path: '/a',
            exact: true,
            component:
              "() => React.createElement(require('<%= cwd %>/packages/umi-build-dev/src/Compiling.js').default, { route: '/a' })",
          },
          {
            path: '/list',
            component: "require('../list/layout.js').default",
            routes: [
              {
                path: '/list/',
                exact: true,
                component:
                  "() => React.createElement(require('<%= cwd %>/packages/umi-build-dev/src/Compiling.js').default, { route: '/list/' })",
              },
              {
                path: '/list/list',
                exact: true,
                component: "require('../list/list.js').default",
              },
            ],
          },
        ],
      },
    ]);
  });
});

describe('FilesGenerator (getRequestedRoutes)', () => {
  it('normal', () => {
    const service = {
      routes: [
        {
          path: '/a',
          exact: true,
          component: './a.js',
        },
        {
          path: '/list',
          component: './list/layout.js',
          routes: [
            {
              path: '/list/',
              exact: true,
              component: './list/index.js',
            },
            {
              path: '/list/list',
              exact: true,
              component: './list/list.js',
            },
          ],
        },
      ],
      paths: {
        absSrcPath: join(__dirname, '../test/fixtures/FilesGenerator/normal'),
        tmpDirPath: '.umi',
      },
      config: {},
      applyPlugins: (key, { initialValue }) => initialValue,
    };
    const fg = new FilesGenerator(service);
    const requested = fg.getRequestedRoutes({
      '/list/list': 1,
    });
    expect(requested).toEqual({ '/list': 1, '/list/list': 1 });
  });
});
