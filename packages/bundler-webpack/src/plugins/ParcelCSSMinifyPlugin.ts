import type { TransformOptions } from '@parcel/css';
import { importLazy } from '@umijs/utils';
import { Buffer } from 'buffer';
import { join } from 'path';
import { RawSource, SourceMapSource } from '../../compiled/webpack-sources';
import type { Compilation, Compiler } from '../../compiled/webpack/types';

const pkgPath = join(__dirname, '../../package.json');
const pkg = require(pkgPath);

type MinifyPluginOpts = Omit<TransformOptions, 'filename' | 'code' | 'minify'>;

const PLUGIN_NAME = 'parcel-css-minify-plugin';
const CSS_FILE_REG = /\.css(?:\?.*)?$/i;

export class ParcelCSSMinifyPlugin {
  private readonly options: MinifyPluginOpts;

  constructor(opts: MinifyPluginOpts = {}) {
    this.options = opts;
  }

  apply(compiler: Compiler) {
    const meta = JSON.stringify({
      name: pkg.name,
      version: pkg.version,
      options: this.options,
    });

    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.chunkHash.tap(PLUGIN_NAME, (_, hash) =>
        hash.update(meta),
      );

      compilation.hooks.processAssets.tapPromise(
        {
          name: PLUGIN_NAME,
          // @ts-ignore
          stage: compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
          additionalAssets: true,
        },
        async () => await this.transformAssets(compilation),
      );

      compilation.hooks.statsPrinter.tap(PLUGIN_NAME, (statsPrinter) => {
        statsPrinter.hooks.print
          .for('asset.info.minimized')
          // @ts-ignore
          .tap(PLUGIN_NAME, (minimized, { green, formatFlag }) => {
            // @ts-ignore
            return minimized ? green(formatFlag('minimized')) : undefined;
          });
      });
    });
  }

  private async transformAssets(compilation: Compilation): Promise<void> {
    const {
      options: { devtool },
    } = compilation.compiler;

    const sourcemap =
      this.options.sourceMap === undefined
        ? ((devtool && (devtool as string).includes('source-map')) as boolean)
        : this.options.sourceMap;

    const assets = compilation.getAssets().filter((asset) => {
      return !asset.info.minimized && CSS_FILE_REG.test(asset.name);
    });

    await Promise.all(
      assets.map(async (asset) => {
        const { source, map } = asset.source.sourceAndMap();
        const sourceAsString = source.toString();
        const code = typeof source === 'string' ? Buffer.from(source) : source;

        const { transform }: typeof import('@parcel/css') =
          importLazy('@parcel/css');
        const result = await transform({
          filename: asset.name,
          code,
          minify: true,
          sourceMap: sourcemap,
          ...this.options,
        });
        const codeString = result.code.toString();

        compilation.updateAsset(
          asset.name,
          // @ts-ignore
          sourcemap
            ? new SourceMapSource(
                codeString,
                asset.name,
                JSON.parse(result.map!.toString()),
                sourceAsString,
                map as any,
                true,
              )
            : new RawSource(codeString),
          {
            ...asset.info,
            minimized: true,
          },
        );
      }),
    );
  }
}
