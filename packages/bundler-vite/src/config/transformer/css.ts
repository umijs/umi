import type { IConfigProcessor } from '.';

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
  const config: ReturnType<IConfigProcessor> = { css: { postcss: {}, preprocessorOptions: {} } };

  config.css!.postcss = {
    // handle postcssLoader
    ...(userConfig.postcssLoader?.postcssOptions || {}),
    plugins: [
      ...(userConfig.postcssLoader?.postcssOptions?.plugins || []),
      require('postcss-preset-env')({
        // handle targets for css
        browsers: userConfig.targets,
        // handle autoprefixer
        autoprefixer: {
          flexbox: 'no-2009',
          ...(userConfig.autoprefixer || {}),
        },
        stage: 3,
      }),
      // handle extraPostCSSPlugins
      ...(userConfig.extraPostCSSPlugins || []),
    ]
  };

  config.css!.preprocessorOptions!.less = {
    javascriptEnabled: true,
    // handle lessLoader
    ...(userConfig.lessLoader || {}),
    // handle theme
    modifyVars: userConfig.theme || {},
  }

  return config;
}) as IConfigProcessor;
