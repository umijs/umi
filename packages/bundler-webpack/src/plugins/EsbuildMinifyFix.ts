import { MagicString } from '@umijs/utils';
import {
  Asset,
  Compilation,
  Compiler,
  ModuleFilenameHelpers,
  sources,
} from '../../compiled/webpack';

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
        (assets: Record<string, sources.Source>) =>
          this.minifyFix(compilation, assets),
      );
    });
  }

  async minifyFix(
    compilation: Compilation,
    assets: Record<string, sources.Source>,
  ) {
    const matchObject = ModuleFilenameHelpers.matchObject.bind(undefined, {
      include: [/\.(js|mjs|cjs)$/],
    });

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

          return { name, info, inputSource: source };
        }),
    );

    if (assetsForMinify.length === 0) {
      return;
    }

    const { SourceMapSource, RawSource } = sources;

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

        const output: any = {};

        if (map) {
          output.source = new SourceMapSource(code, name, map, source, true);
        } else {
          output.source = new RawSource(code);
        }

        compilation.updateAsset(name, output.source, {
          EsbuildMinifyFix: true,
        });
      }
    }
  }
}
