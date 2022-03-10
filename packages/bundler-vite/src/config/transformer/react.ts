import reactPlugin from '@vitejs/plugin-react';
import type { IConfigProcessor } from '.';

/**
 * enable react plugin & transform umi babel to vite babel
 */
export default (function react(userConfig) {
  const config: ReturnType<IConfigProcessor> = { plugins: [] };

  config.plugins?.push(
    // pre-compiled rollup type is different with installed rollup type
    // so this plugin type is not compatible with config.plugins
    // @ts-expect-error
    reactPlugin({
      // jsxRuntime: 'automatic',
      include: userConfig.extraBabelIncludes,
      babel: {
        plugins: userConfig.extraBabelPlugins,
        presets: userConfig.extraBabelPresets,
      },
    }),
  );

  return config;
} as IConfigProcessor);
