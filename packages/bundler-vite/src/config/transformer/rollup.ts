import path from 'path';
// @ts-ignore
import polyfill from 'rollup-plugin-polyfill';
import { visualizer } from 'rollup-plugin-visualizer';
import copy from 'rollup-plugin-copy';
import { winPath } from '@umijs/utils';

import type { IConfigProcessor } from '.';

/**
 * transform umi configs to vite rollup options
 * @note  include configs:
 *        - externals
 *        - polyfill
 *        - analyze
 *        - copy
 */
export default (function rollup(userConfig) {
  const config: ReturnType<IConfigProcessor> = { build: { rollupOptions: { plugins: [] } } };

  // handle externals
  if (typeof userConfig.externals === 'object') {
    // transform to globals
    config.build!.rollupOptions!.output = {
      globals: userConfig.externals,
    };

    // transform to external
    config.build!.rollupOptions!.external = Object.keys(userConfig.externals);
  }

  // handle polyfill
  if (Array.isArray(userConfig.polyfill?.imports)) {
    config.build!.rollupOptions!.plugins!.push(
      polyfill(userConfig.polyfill.imports),
    );
  }

  // handle analyze
  if (typeof userConfig.analyze === 'object' || process.env.ANALYZE) {
    config.build!.rollupOptions!.plugins!.push(
      visualizer({
        open: true,
        json: userConfig.analyze.generateStatsFile,
        // TODO: other options transform, refer: https://umijs.org/config#analyze
      }),
    );
  }

  // handle copy
  if (Array.isArray(userConfig.copy)) {
    config.build!.rollupOptions!.plugins!.push(
      copy({
        targets: userConfig.copy.map(item => {
          if (typeof item === 'string') {
            // umi copy support ['a.txt', 'b.txt'], need to transform
            return {
              src: item,
              dest: winPath(path.join(userConfig.outputPath, item)),
            };
          } else {
            // transform fields
            return {
              src: item.from,
              dest: item.to,
            };
          }
        }),
      }),
    );
  }

  return config;
}) as IConfigProcessor;
