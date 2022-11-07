import reactPlugin from '@vitejs/plugin-react';
import type { IConfigProcessor } from '.';

/**
 * enable react plugin & transform umi babel to vite babel
 */
export default (function react(userConfig) {
  const config: ReturnType<IConfigProcessor> = { plugins: [] };

  // add react plugin config ability.
  if (!userConfig.vue) {
    config.plugins?.push(
      // pre-compiled rollup type is different with installed rollup type
      // so this plugin type is not compatible with config.plugins
      // @ts-ignore
      reactPlugin({
        // jsxRuntime: 'automatic',
        babel: {
          plugins: userConfig.extraBabelPlugins,
          presets: userConfig.extraBabelPresets,
        },
        ...(userConfig?.react || {}),
      }),
    );
  }

  return config;
} as IConfigProcessor);
