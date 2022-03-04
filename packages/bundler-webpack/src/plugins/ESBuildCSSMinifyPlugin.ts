import { transform } from '@umijs/bundler-utils/compiled/esbuild';
import { Compilation, Compiler } from '@umijs/bundler-webpack/compiled/webpack';
import {
  RawSource,
  SourceMapSource,
} from '@umijs/bundler-webpack/compiled/webpack-sources';

const version = require('../../package.json');

interface IOpts {
  sourcemap?: any;
}

const PLUGIN_NAME = 'ESBuildCSSMinifyPlugin';
const RE_CSS_FILE = /\.css(\?.*)?$/i;

class ESBuildCSSMinifyPlugin {
  public options: IOpts;
  constructor(options: IOpts = {}) {
    this.options = options;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.chunkHash.tap(PLUGIN_NAME, (_, hash) => {
        hash.update(
          JSON.stringify({
            version,
            options: this.options,
          }),
        );
      });
      compilation.hooks.processAssets.tapPromise(
        {
          name: PLUGIN_NAME,
          stage: 400,
          additionalAssets: true,
        },
        async () => {
          await this.transformAssets(compilation);
        },
      );
    });
  }

  async transformAssets(compilation: Compilation): Promise<void> {
    const {
      options: { devtool },
    } = compilation.compiler;
    const sourcemap =
      this.options.sourcemap === undefined ? !!devtool : this.options.sourcemap;
    const assets = compilation.getAssets().filter((asset) => {
      return !asset.info.minimized && RE_CSS_FILE.test(asset.name);
    });
    await Promise.all(
      assets.map(async (asset) => {
        const { source, map } = asset.source.sourceAndMap();
        const sourceAsString = source.toString();
        const result = await transform(sourceAsString, {
          loader: 'css',
          sourcemap,
          sourcefile: asset.name,
          minify: true,
        });
        compilation.updateAsset(
          asset.name,
          // @ts-ignore
          sourcemap
            ? new SourceMapSource(
                result.code,
                asset.name,
                result.map as any,
                sourceAsString,
                map,
                true,
              )
            : new RawSource(result.code),
          { ...asset.info, minimized: true },
        );
      }),
    );
  }
}

export default ESBuildCSSMinifyPlugin;
