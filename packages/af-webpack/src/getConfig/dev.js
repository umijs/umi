import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

export default function(webpackConfig, opts) {
  webpackConfig
    .devtool(opts.devtool || 'cheap-module-source-map')
    .output.pathinfo(true);

  webpackConfig
    .plugin('hmr')
    .use(require('webpack/lib/HotModuleReplacementPlugin'));

  if (process.env.HARD_SOURCE) {
    const pkgPath = join(opts.cwd, 'package.json');
    if (!existsSync(pkgPath)) {
      writeFileSync(pkgPath, '{}', 'utf-8');
    }
    webpackConfig
      .plugin('hard-source')
      .use(require('hard-source-webpack-plugin'));
  }
}
