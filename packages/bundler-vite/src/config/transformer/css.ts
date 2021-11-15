import type { IConfigProcessor } from '.';

// refer: https://github.com/umijs/umi-next/blob/867e0c196296efbbdb95203cca35db2fa639808b/packages/bundler-webpack/src/utils/browsersList.ts#L5
function getBrowserlist(targets: Record<string, string | boolean>) {
  return (
    targets.browsers ||
    Object.keys(targets).map((key) => {
      return `${key} >= ${targets[key] === true ? '0' : targets[key]}`;
    })
  );
}

/**
 * transform umi css pre-processor configs to vite postcss config
 * @note  include configs:
 *        - postcssLoader
 *        - targets (css only)
 *        - autoprefixer
 *        - extraPostCSSPlugins
 *        - lessLoader
 *        - theme
 */
export default (function css(userConfig) {
  const config: ReturnType<IConfigProcessor> = {
    css: { postcss: {}, preprocessorOptions: {} },
    resolve: {
      alias: [
        // to fix less import issue https://github.com/vitejs/vite/issues/2185
        { find: /^~/, replacement: '' },
      ],
    },
  };

  config.css!.postcss = {
    // handle postcssLoader
    ...(userConfig.postcssLoader?.postcssOptions || {}),
    plugins: [
      ...(userConfig.postcssLoader?.postcssOptions?.plugins || []),
      require('postcss-preset-env')({
        // handle targets for css
        browsers: getBrowserlist(userConfig.targets || {}),
        // handle autoprefixer
        autoprefixer: {
          flexbox: 'no-2009',
          ...(userConfig.autoprefixer || {}),
        },
        stage: 3,
      }),
      // handle extraPostCSSPlugins
      ...(userConfig.extraPostCSSPlugins || []),
    ],
  };

  config.css!.preprocessorOptions!.less = {
    javascriptEnabled: true,
    // handle lessLoader
    ...(userConfig.lessLoader?.lessOptions || {}),
    // handle theme
    modifyVars: userConfig.theme || {},
  };

  return config;
} as IConfigProcessor);
