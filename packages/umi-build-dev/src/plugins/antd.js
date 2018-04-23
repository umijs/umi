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
    if (existsSync(pkgPath)) {
      const { dependencies = {} } = require(pkgPath); // eslint-disable-line
      if (dependencies.antd) {
        memo.alias.antd = dirname(
          require.resolve(join(cwd, 'node_modules/antd/package')),
        );
      }
      if (dependencies['antd-mobile']) {
        memo.alias['antd-mobile'] = dirname(
          require.resolve(join(cwd, 'node_modules/antd-mobile/package.json')),
        );
      }
    }

    return memo;
  });
}
