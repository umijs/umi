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
// 在windows环境下，很多工具都会把换行符lf自动改成crlf，修改了一下。
// https://github.com/cssmagic/blog/issues/22
const isWindows =
  typeof process !== 'undefined' && process.platform === 'win32';
const winEOL = content => {
  if (typeof content !== 'string') {
    return content;
  }
  return isWindows ? content.replace(/\r/g, '') : content;
};


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
      expect(code).toEqual(
        winEOL(readFileSync(getPath(`${item}.result.js`), 'utf-8')),
      );
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
        winEOL(readFileSync(getPath(`${item}.resultWithLayout.js`), 'utf-8')),
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
    expect(findLayoutNode(routeNode, 0, '/sddd').target.end).toEqual(299);
  });

  it('seme as layout, return root', () => {
    expect(findLayoutNode(routeNode, 0, '/users').target.end).toEqual(299);
  });

  it('found, return /users', () => {
    expect(findLayoutNode(routeNode, 0, '/users/hahaha').target.start).toEqual(
      74,
    );
  });

  it('found, return /users/settings', () => {
    expect(
      findLayoutNode(routeNode, 0, '/users/settings/some').target.start,
    ).toEqual(133);
  });

  it('found, return /users/settings/help', () => {
    expect(
      findLayoutNode(routeNode, 0, '/users/settings/help/faq').target.start,
    ).toEqual(210);
  });

  it('found, return /users/settings', () => {
    expect(
      findLayoutNode(
        routeNode,
        0,
        '/users/settings/wanted/adad/adadv/adadad/adadadad/adadad',
      ).target.start,
    ).toEqual(133);
  });
});

describe('find relative layout node', () => {
  it('not found, return root', () => {
    expect(findLayoutNode(relativeRouteNode, 0, '/adada').target.start).toEqual(
      152,
    );
    expect(findLayoutNode(relativeRouteNode, 0, '/adada').level).toEqual(1);
  });

  it('found, return /account/settings', () => {
    expect(
      findLayoutNode(relativeRouteNode, 0, '/account/settings/base/adadadaad')
        .target.start,
    ).toEqual(1113);
  });

  it('test uppercase, return /account/settings', () => {
    expect(
      findLayoutNode(relativeRouteNode, 0, '/Account/Settings/Haha').target
        .start,
    ).toEqual(1113);
  });

  it('found, return /account', () => {
    expect(
      findLayoutNode(relativeRouteNode, 0, '/account/adada').target.start,
    ).toEqual(250);
  });
});
