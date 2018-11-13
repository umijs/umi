import { join } from 'path';
import { readFileSync } from 'fs';
import { getNewRouteCode } from './writeNewRoute';

const typeMap = ['./fixtures/exportDefaultRoutes', './fixtures/importedRoutes'];
const getPath = path => join(__dirname, path);

describe('test get config path', () => {
  it('get path in antdpro', () => {
    const configPath = getPath('../fixtures/block/antdpro/config/config.js');
    const routesPath = getPath(
      '../fixtures/block/antdpro/config/router.config.js',
    );

    const { routesPath: path } = getNewRouteCode(
      configPath,
      'demo',
      '../fixtures/block/antdpro',
    );
    expect(path).toEqual(routesPath);
  });

  it('get path in simple demo', () => {
    const configPath = getPath('../fixtures/block/simple/.umirc.js');

    const { routesPath: path } = getNewRouteCode(configPath, 'demo', null);
    expect(path).toEqual(configPath);
  });

  it('get path in alias demo', () => {
    const configPath = getPath('../fixtures/block/alias/config/config.js');
    const aliasPath = getPath('../fixtures/block/alias');
    const realConfig = join(aliasPath, 'routes.js');

    const { routesPath: path } = getNewRouteCode(configPath, 'demo', aliasPath);
    expect(path).toEqual(realConfig);
  });
});

describe('test get route code', () => {
  it('get route code no params', () => {
    typeMap.forEach(item => {
      const { code } = getNewRouteCode(getPath(`${item}.js`), 'demo');
      expect(code).toEqual(readFileSync(getPath(`${item}.result.js`), 'utf-8'));
    });
  });

  it('get route code with layout path', () => {
    typeMap.forEach(item => {
      const { code } = getNewRouteCode(
        getPath(`${item}.js`),
        'demo',
        null,
        '/aa/xx/sdad',
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
        'demo',
        null,
        '/aa/xx/sdad',
      );
    } catch (error) {
      expect(error.message).toEqual('route path not found.');
    }
  });
});
