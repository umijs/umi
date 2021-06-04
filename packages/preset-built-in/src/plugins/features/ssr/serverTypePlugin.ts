import { webpack } from '@umijs/types';
import { existsSync, readFileSync } from 'fs';

/**
 * generate assets when webpack bundler emit
 */
export default class AssetWebpackPlugin {
  constructor(
    public assetPaths: { name: string; path?: string; content?: string }[],
  ) {
    this.assetPaths = assetPaths;
  }
  apply(compiler: webpack.Compiler) {
    compiler.hooks.emit.tap('AssetWebpack', (compilation) => {
      this.assetPaths.forEach(({ name, path, content }) => {
        if (!name) {
          return;
        }
        const filePath = path || '';
        const assetContent = existsSync(filePath)
          ? readFileSync(filePath, 'utf-8')
          : content;
        if (assetContent) {
          compilation.assets[name] = {
            source: () => assetContent,
            size: () => assetContent.length,
          };
        }
      });
    });
  }
}
