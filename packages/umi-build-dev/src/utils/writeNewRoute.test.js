import { join } from 'path';
import { readFileSync } from 'fs';
import { getNewRouteCode, findLayoutNode } from './writeNewRoute';
import routeNode from './fixtures/routeNode';
import relativeRouteNode from './fixtures/relativeRouteNode';

const typeMap = [
  './fixtures/exportDefaultRoutes',
  './fixtures/importedRoutes',
  './fixtures/exportsRoutes',
];
const getPath = path => join(__dirname, path);

describe('test get config path', () => {
  it('get path in antdpro', () => {
    const configPath = getPath('../fixtures/block/antdpro/config/config.js');
    const routesPath = getPath(
      '../fixtures/block/antdpro/config/router.config.js',
    );

    const { routesPath: path } = getNewRouteCode(
      configPath,
      { path: '/demo', component: './demo' },
      '../fixtures/block/antdpro',
    );
    expect(path).toEqual(routesPath);
  });

  it('get path in simple demo', () => {
    const configPath = getPath('../fixtures/block/simple/.umirc.js');

    const { routesPath: path } = getNewRouteCode(
      configPath,
      {
        path: '/demo',
        component: './demo',
      },
      null,
    );
    expect(path).toEqual(configPath);
  });

  it('get path in alias demo', () => {
    const configPath = getPath('../fixtures/block/alias/config/config.js');
    const aliasPath = getPath('../fixtures/block/alias');
    const realConfig = join(aliasPath, 'routes.js');

    const { routesPath: path } = getNewRouteCode(
      configPath,
      { path: '/demo', component: './demo' },
      aliasPath,
    );
    expect(path).toEqual(realConfig);
  });
});

describe('test get route code', () => {
  it('get route code no params', () => {
    process.env.BIGFISH_COMPAT = true;
    typeMap.forEach(item => {
      const { code } = getNewRouteCode(getPath(`${item}.js`), {
        path: '/demo',
        component: './Demo',
      });
      expect(code).toEqual(readFileSync(getPath(`${item}.result.js`), 'utf-8'));
    });
  });

  it('get route code with layout path', () => {
    typeMap.forEach(item => {
      const { code } = getNewRouteCode(
        getPath(`${item}.js`),
        {
          path: '/aa/xx/sdad/demo',
          component: './aa/xx/sdad/Demo',
        },
        null,
      );
      expect(code).toEqual(
        readFileSync(getPath(`${item}.resultWithLayout.js`), 'utf-8'),
      );
    });
  });

  it('get rout not found', () => {
    try {
      getNewRouteCode(
        getPath('./fixtures/notRoutes.js'),
        {
          path: '/aa/xx/sdad',
          component: './aa/xx/sdad',
        },
        null,
      );
    } catch (error) {
      expect(error.message).toEqual('route path not found.');
    }
  });
});

describe('find layout node', () => {
  it('not found, return root', () => {
    expect(findLayoutNode(routeNode, '/sddd').end).toEqual(299);
  });

  it('seme as layout, return root', () => {
    expect(findLayoutNode(routeNode, '/users').end).toEqual(299);
  });

  it('found, return /users', () => {
    expect(findLayoutNode(routeNode, '/users/hahaha').start).toEqual(74);
  });

  it('found, return /users/settings', () => {
    expect(findLayoutNode(routeNode, '/users/settings/some').start).toEqual(
      133,
    );
  });

  it('found, return /users/settings/help', () => {
    expect(findLayoutNode(routeNode, '/users/settings/help/faq').start).toEqual(
      210,
    );
  });

  it('found, return /users/settings', () => {
    expect(
      findLayoutNode(
        routeNode,
        '/users/settings/wanted/adad/adadv/adadad/adadadad/adadad',
      ).start,
    ).toEqual(133);
  });
});

describe('find relative layout node', () => {
  it('not found, return root', () => {
    expect(findLayoutNode(relativeRouteNode, '/adada').start).toEqual(152);
  });

  it('found, return /account/settings', () => {
    expect(
      findLayoutNode(relativeRouteNode, '/account/settings/base/adadadaad')
        .start,
    ).toEqual(1113);
  });

  it('test uppercase, return /account/settings', () => {
    expect(
      findLayoutNode(relativeRouteNode, '/Account/Settings/Haha').start,
    ).toEqual(1113);
  });

  it('found, return /account', () => {
    expect(findLayoutNode(relativeRouteNode, '/account/adada').start).toEqual(
      250,
    );
  });
});
