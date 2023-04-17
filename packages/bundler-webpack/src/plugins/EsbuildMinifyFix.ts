import { MagicString, remapping } from '@umijs/utils';
import {
  Asset,
  Compilation,
  Compiler,
  ModuleFilenameHelpers,
  sources,
} from '../../compiled/webpack';

const JS_FILE_REG = /\.(js|mjs|cjs)$/;

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

  private isIIFE(source: string) {
    source = source.trim();
    if (source.startsWith('(function(){"use strict";')) {
      return true;
    }
    if (
      source.startsWith('(function(){') &&
      (source.endsWith('})()') || source.endsWith('})();'))
    ) {
      return true;
    }
    return false;
  }

  async minifyFix(
    compilation: Compilation,
    assets: Record<string, sources.Source>,
  ) {
    const matchObject = ModuleFilenameHelpers.matchObject.bind(undefined, {
      include: [JS_FILE_REG],
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

          // Skip copy-webpack-plugin files
          // https://github.com/webpack-contrib/copy-webpack-plugin/blob/59bdbb2eb550963715782fa0855fa3c382fa0438/src/index.js#L1062
          if (info?.copied) {
            return false;
          }

          // 处理过无需再次处理
          if (info?.EsbuildMinifyFix) {
            return false;
          }

          // skip worker file
          if (name.endsWith('.worker.js')) {
            return false;
          }

          // 如果存在 sourceMap 则不处理
          if (info?.related?.sourceMap) {
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
      const originCode = source.toString();
      let newCode = originCode;

      // 尝试不处理 无问题的代码
      if (
        !newCode.startsWith('"use strict";(self.') &&
        !newCode.startsWith('(self.webpack') &&
        !this.isIIFE(newCode)
      ) {
        const bundle = new MagicString(newCode);
        bundle.prepend('!(function(){').append('}());');
        newCode = bundle.toString();

        const output: {
          source?: any;
        } = {};
        if (map) {
          const bundleMap = bundle.generateMap({
            source: name,
            file: `${name}.map`,
            includeContent: true,
            hires: true,
          });

          // merge source map
          const originMapAsString = JSON.stringify(map);
          const mergedMap = remapping(JSON.stringify(bundleMap), (file) => {
            if (file === name) {
              return originMapAsString;
            }
            return null;
          });

          output.source = new SourceMapSource(
            newCode,
            name,
            mergedMap,
            originCode,
            map,
            true,
          );
        } else {
          output.source = new RawSource(newCode);
        }

        compilation.updateAsset(name, output.source!, {
          ...asset.info,
          EsbuildMinifyFix: true,
        });
      }
    }
  }
}
