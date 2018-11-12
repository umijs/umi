import { join } from 'path';
import { readFileSync } from 'fs';
import { getNewRouteCode } from './writeNewRoute';

const antdSrc = '../fixtures/block/antdpro';

describe('insertRouteContent', () => {
  it('getRealRoutesPath in antdpro', () => {
    const configPath = join(
      __dirname,
      '../fixtures/block/antdpro/config/config.js',
    );
    const routesPath = join(
      __dirname,
      '../fixtures/block/antdpro/config/router.config.js',
    );
    // 不带 layout 参数
    let { code, routesPath: path } = getNewRouteCode(
      configPath,
      'demo',
      antdSrc,
    );
    expect(path).toEqual(routesPath);

    const root = routesPath + '.root.js';
    expect(code).toEqual(readFileSync(root, 'utf-8'));

    // 带 layout 参数
    code = getNewRouteCode(configPath, 'demo', antdSrc, '/aa/xx').code;
    const layout = routesPath + '.layout.js';
    expect(code).toEqual(readFileSync(layout, 'utf-8'));
  });

  it('getRealRoutesPath in simple demo', () => {
    const configPath = join(__dirname, '../fixtures/block/simple/.umirc.js');

    // 不带 layout 参数
    let { code, routesPath: path } = getNewRouteCode(configPath, 'demo', null);
    expect(path).toEqual(configPath);
    const root = configPath + '.root.js';
    expect(code).toEqual(readFileSync(root, 'utf-8'));

    // 带 layout 参数
    code = getNewRouteCode(configPath, 'demo', null, '/aa/xx/sdad').code;
    const layout = configPath + '.layout.js';
    expect(code).toEqual(readFileSync(layout, 'utf-8'));
  });

  it.only('getRealRoutesPath in alias demo', () => {
    const configPath = join(
      __dirname,
      '../fixtures/block/alias/config/config.js',
    );
    const aliasPath = join(__dirname, '../fixtures/block/alias');
    const realConfig = join(aliasPath, 'routes.js');

    // 不带 layout 参数
    let { code, routesPath: path } = getNewRouteCode(
      configPath,
      'demo',
      aliasPath,
    );
    expect(path).toEqual(realConfig);
    const root = realConfig + '.root.js';
    expect(code).toEqual(readFileSync(root, 'utf-8'));

    // 带 layout 参数
    code = getNewRouteCode(configPath, 'demo', aliasPath, '/aa/xx').code;
    const layout = realConfig + '.layout.js';
    expect(code).toEqual(readFileSync(layout, 'utf-8'));
  });
});
