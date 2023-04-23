import type { IConfig } from '@umijs/bundler-webpack/dist/types';
import path from 'path';
import {
  visualizer,
  type PluginVisualizerOptions,
} from 'rollup-plugin-visualizer';
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
    const {
      generateStatsFile,
      openAnalyzer,
      reportFilename,
      reportTitle,
      excludeAssets,
      ...analyzeOverrides
    } = (userConfig.analyze || {}) as PluginVisualizerOptions &
      IConfig['analyze'];

    function getExclude(): PluginVisualizerOptions['exclude'] {
      if (!excludeAssets) return [];
      const excludes = Array.isArray(excludeAssets)
        ? excludeAssets
        : [excludeAssets];
      return (
        excludes
          .filter((exclude) => {
            return typeof exclude === 'string';
          })
          // @ts-ignore
          .map((exclude: string) => {
            return {
              bundle: exclude,
              file: exclude,
            };
          })
      );
    }

    // @ts-ignore
    config.build!.rollupOptions!.plugins!.push(
      visualizer({
        template: generateStatsFile ? 'raw-data' : 'treemap',
        open: openAnalyzer,
        exclude: getExclude(),
        gzipSize: true,
        brotliSize: true,
        filename: reportFilename,
        title: reportTitle as string | undefined,
        ...analyzeOverrides,
      }),
    );
  }

  // handle copy
  if (Array.isArray(userConfig.copy)) {
    // @ts-ignore rollup 升级导致的类型不正确, 这里的用法没问题
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
