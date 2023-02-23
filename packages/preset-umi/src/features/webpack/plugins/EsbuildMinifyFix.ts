import {
  Asset,
  Compilation,
  Compiler,
  ModuleFilenameHelpers,
  sources,
} from '@umijs/bundler-webpack/compiled/webpack';
import MagicString from 'magic-string';

export class EsbuildMinifyFix {
  private name: string;
  constructor() {
    this.name = `EsbuildMinifyFix`;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(this.name, (compilation: Compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: this.name,
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_DEV_TOOLING,
          additionalAssets: true,
        },
        (assets: any) => this.minifyFix(compiler, compilation, assets),
      );
    });
  }

  async minifyFix(
    compiler: Compiler,
    compilation: Compilation,
    assets: Record<string, sources.Source>,
  ) {
    const matchObject = ModuleFilenameHelpers.matchObject.bind(undefined, {
      include: [/\.(js|mjs|cjs)$/],
    });
    const cache = compilation.getCache('EsbuildMinifyFix');

    const { output } = compiler.options;

    // 只对默认情况情况, 非默认情况不处理这种情况
    if (typeof output.library?.type !== 'undefined') {
      return;
    }

    const assetsForMinify = await Promise.all(
      Object.keys(assets)
        .filter((name) => {
          if (!matchObject(name)) {
            return false;
          }

          const { info } = compilation.getAsset(name) || {};
          if (!info?.minimized) {
            return false;
          }

          return true;
        })
        .map(async (name) => {
          const { info, source } = compilation.getAsset(name) as Asset;

          const eTag = cache.getLazyHashedEtag(source);
          const cacheItem = cache.getItemCache(name, eTag);
          const output = await cacheItem.getPromise();

          return { name, info, inputSource: source, output, cacheItem };
        }),
    );

    if (assetsForMinify.length === 0) {
      return;
    }

    const { SourceMapSource, RawSource } = compiler.webpack.sources;

    for (const asset of assetsForMinify) {
      const { name, inputSource } = asset;
      const { source, map } = inputSource.sourceAndMap();

      let code = source;
      if (Buffer.isBuffer(code)) {
        code = code.toString();
      }

      // 尝试不处理 无问题的代码
      if (
        !code.startsWith('"use strict";(self.') &&
        !code.startsWith('(function(){"use strict";') &&
        !code.startsWith('(self.webpack')
      ) {
        const bundle = new MagicString(code);
        bundle.indent().prepend('!(function () {\n').append('}());');
        code = bundle.toString();
      }

      const output: any = {};

      if (map) {
        output.source = new SourceMapSource(
          code,
          name,
          output.map,
          source,
          output.map,
          true,
        );
      } else {
        output.source = new RawSource(code);
      }

      compilation.updateAsset(name, output.source, {
        EsbuildMinifyFix: true,
      });
    }
  }
}
