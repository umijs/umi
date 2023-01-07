import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import type { IConfigProcessor } from '.';
import copy from '../../../compiled/rollup-plugin-copy';

/**
 * transform umi configs to vite rollup options
 * @note  include configs:
 *        - externals
 *        - polyfill
 *        - analyze
 *        - copy
 */
export default (function rollup(userConfig) {
  const config: ReturnType<IConfigProcessor> = {
    build: { rollupOptions: { plugins: [], output: {} } },
  };

  // handle analyze
  if (typeof userConfig.analyze === 'object' || process.env.ANALYZE) {
    interface Filter {
      bundle?: string;
      file?: string;
    }

    interface IAnalyze {
      excludeAssets?: Filter;
      openAnalyzer?: boolean;
      generateStatsFile?: boolean;
      reportFilename?: string;
      reportTitle?: string;
    }

    const analyze = <IAnalyze>userConfig.analyze;

    function getExclude(): Filter[] {
      if (!analyze.excludeAssets) return [];
      const excludes = Array.isArray(analyze.excludeAssets)
        ? analyze.excludeAssets
        : [analyze.excludeAssets];
      return excludes
        .filter((exclude: string | RegExp | Function) => {
          return typeof exclude === 'string';
        })
        .map((exclude: string) => {
          return {
            bundle: exclude,
            file: exclude,
          };
        });
    }
    config.build!.rollupOptions!.plugins!.push(
      visualizer({
        template: analyze.generateStatsFile ? 'raw-data' : 'treemap',
        open: analyze.openAnalyzer,
        exclude: getExclude(),
        gzipSize: true,
        brotliSize: true,
        filename: analyze.reportFilename,
        title: analyze.reportTitle,
        // TODO: other options transform, refer: https://umijs.org/docs/api/config#analyze
      }),
    );
  }

  // handle copy
  if (Array.isArray(userConfig.copy)) {
    config.build!.rollupOptions!.plugins!.push(
      copy({
        targets: userConfig.copy.map((item) => {
          if (typeof item === 'string') {
            // umi copy support ['a.txt', 'b.txt'], need to transform
            return {
              src: item,
              dest: userConfig.outputPath || 'dist',
            };
          } else {
            // transform fields
            return {
              src: item.from,
              dest: path.dirname(item.to),
              rename: path.basename(item.to),
            };
          }
        }),
        hook: 'writeBundle',
      }),
    );
  }

  // handle hash
  if (userConfig.hash !== true) {
    // disable vite default hash filename
    // refer: https://github.com/vitejs/vite/blob/deb84c0b053b5c1e6a4162a224108d1d853dbb04/packages/vite/src/node/build.ts#L452
    Object.assign(config.build!.rollupOptions!.output!, {
      entryFileNames: '[name].js',
      chunkFileNames: '[name].js',
      assetFileNames: '[name].[ext]',
    });
  }

  return config;
} as IConfigProcessor);
