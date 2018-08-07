import { join, dirname } from 'path';
import { existsSync } from 'fs';

export default function(api) {
  const { cwd } = api.service;

  api.register('modifyAFWebpackOpts', ({ memo }) => {
    memo.babel.plugins = [
      ...(memo.babel.plugins || []),
      [
        require.resolve('babel-plugin-import'),
        {
          libraryName: 'antd',
          libraryDirectory: 'es',
          style: true,
        },
        'antd',
      ],
      [
        require.resolve('babel-plugin-import'),
        {
          libraryName: 'antd-mobile',
          libraryDirectory: 'es',
          style: true,
        },
        'antd-mobile',
      ],
    ];

    memo.alias = {
      ...(memo.alias || {}),
      'antd-mobile': dirname(require.resolve('antd-mobile/package.json')),
      antd: dirname(require.resolve('antd/package.json')),
    };

    // 支持用户指定 antd 和 antd-mobile 的版本
    const pkgPath = join(cwd, 'package.json');
    // 兼容部署模式为 chair 的 Bigfish 应用
    const pkgPathInChair = join(dirname(dirname(cwd)), 'package.json');
    const realPkgPath =
      (existsSync(pkgPath) && pkgPath) ||
      (existsSync(pkgPathInChair) && pkgPathInChair);
    if (existsSync(realPkgPath)) {
      const { dependencies = {} } = require(realPkgPath); // eslint-disable-line
      if (dependencies.antd) {
        memo.alias.antd = dirname(
          require.resolve(
            join(dirname(realPkgPath), 'node_modules/antd/package.json'),
          ),
        );
      }
      if (dependencies['antd-mobile']) {
        memo.alias['antd-mobile'] = dirname(
          require.resolve(
            join(dirname(realPkgPath), 'node_modules/antd-mobile/package.json'),
          ),
        );
      }
    }

    return memo;
  });
}
