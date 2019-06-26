import { join } from 'path';
import { readFileSync } from 'fs';
import { winEOL } from 'umi-utils';

import { getNewRouteCode, writeRouteNode } from './writeNewRoute';
import routeNode from './fixtures/routeNode';
import relativeRouteNode from './fixtures/relativeRouteNode';

const typeMap = [
  './fixtures/exportDefaultRoutes.js',
  './fixtures/importedRoutes.js',
  './fixtures/exportsRoutes.js',
  './fixtures/routesWithTypescript.ts',
];
const getPath = path => join(__dirname, path);

describe('test get config path', () => {
  it('get path in antdpro', () => {
    const configPath = getPath('../fixtures/block/antdpro/config/config.js');
    const routesPath = getPath('../fixtures/block/antdpro/config/router.config.js');

    const { routesPath: path } = getNewRouteCode(
      configPath,
      { path: '/demo', component: './demo' },
      '../fixtures/block/antdpro',
    );
    expect(path).toEqual(routesPath);
  });

  it('get path in antdpro ts', () => {
    const configPath = getPath('../fixtures/block/antdprots/config/config.ts');
    const routesPath = getPath('../fixtures/block/antdprots/config/router.config.ts');

    const { routesPath: path } = getNewRouteCode(
      configPath,
      { path: '/demo', component: './demo' },
      '../fixtures/block/antdprots',
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
      const { code } = getNewRouteCode(getPath(item), {
        path: '/demo',
        component: './Demo',
      });
      expect(code).toEqual(
        winEOL(readFileSync(getPath(item.replace(/\.(ts|js)$/, '.result.$1')), 'utf-8')),
      );
    });
  });

  it('get route code with layout path', () => {
    typeMap.forEach(item => {
      const { code } = getNewRouteCode(
        getPath(item),
        {
          path: '/aa/xx/sdad/demo',
          component: './aa/xx/sdad/Demo',
        },
        null,
      );
      expect(code).toEqual(
        winEOL(readFileSync(getPath(item.replace(/\.(ts|js)$/, '.resultWithLayout.$1')), 'utf-8')),
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
      expect(error.message).toEqual('route array config not found.');
    }
  });
});

describe('find layout node', () => {
  it('not found, return root', () => {
    expect(
      writeRouteNode(routeNode, {
        path: '/sddd',
      }).end,
    ).toEqual(299);
  });

  it('seme as layout', () => {
    expect(
      writeRouteNode(routeNode, {
        path: '/users',
      }).end,
    ).toEqual(293);
  });

  it('found, return /users', () => {
    expect(
      writeRouteNode(routeNode, {
        path: '/users/hahaha',
      }).start,
    ).toEqual(74);
  });

  it('found, return /users/settings', () => {
    expect(
      writeRouteNode(routeNode, {
        path: '/users/settings/some',
      }).start,
    ).toEqual(133);
  });

  it('found, return /users/settings/help', () => {
    expect(
      writeRouteNode(routeNode, {
        path: '/users/settings/help/faq',
      }).start,
    ).toEqual(210);
  });

  it('found, return /users/settings', () => {
    expect(
      writeRouteNode(routeNode, {
        path: '/users/settings/wanted/adad/adadv/adadad/adadadad/adadad',
      }).start,
    ).toEqual(133);
  });
});

describe('find relative layout node', () => {
  it('not found, return root', () => {
    expect(
      writeRouteNode(relativeRouteNode, {
        path: '/adada',
      }).start,
    ).toEqual(152);
  });

  it('found, return /account/settings', () => {
    expect(
      writeRouteNode(relativeRouteNode, {
        path: '/account/settings/base/adadadaad',
      }).start,
    ).toEqual(1113);
  });

  it('found, return /account', () => {
    expect(
      writeRouteNode(relativeRouteNode, {
        path: '/account/adada',
      }).start,
    ).toEqual(250);
  });
});
