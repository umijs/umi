import { extname } from 'path';
import autoprefixer from 'autoprefixer';
import normalizeTheme from './normalizeTheme';

const DEFAULT_BROWSERS = [
  '>1%',
  'last 4 versions',
  'Firefox ESR',
  'not ie < 9', // React doesn't support IE8 anyway
];

export default function(webpackConfig, opts) {
  const isDev = process.env.NODE_ENV === 'development';
  const cssOpts = {
    importLoaders: 1,
    sourceMap: !opts.disableCSSSourceMap,
    ...(opts.cssLoaderOptions || {}),
  };
  // should pass down opts.cwd
  const theme = normalizeTheme(opts.theme, opts);
  const postcssOptions = {
    // Necessary for external CSS imports to work
    // https://github.com/facebookincubator/create-react-app/issues/2677
    ident: 'postcss',
    plugins: () => [
      require('postcss-flexbugs-fixes'), // eslint-disable-line
      autoprefixer({
        overrideBrowserslist: opts.browserslist || DEFAULT_BROWSERS,
        flexbox: 'no-2009',
        ...(opts.autoprefixer || {}),
      }),
      ...(opts.extraPostCSSPlugins ? opts.extraPostCSSPlugins : []),
      ...(isDev ||
      process.env.CSS_COMPRESS === 'none' ||
      process.env.COMPRESS === 'none' ||
      process.env.NO_COMPRESS
        ? []
        : [
            require('cssnano')({
              preset: [
                'default',
                opts.cssnano || {
                  mergeRules: false,
                  // ref: https://github.com/umijs/umi/issues/955
                  normalizeUrl: false,
                },
              ],
            }),
          ]),
    ],
  };
  const cssModulesConfig = {
    modules: true,
    localIdentName:
      cssOpts.localIdentName ||
      (isDev ? '[name]__[local]___[hash:base64:5]' : '[local]___[hash:base64:5]'),
  };
  const lessOptions = {
    modifyVars: theme,
    javascriptEnabled: true,
    ...(opts.lessLoaderOptions || {}),
  };

  let hasSassLoader = true;
  try {
    require.resolve('sass-loader');
  } catch (e) {
    hasSassLoader = false;
  }

  function applyCSSRules(rule, { cssModules, less, sass, stylus }) {
    if (!opts.ssr) {
      if (opts.styleLoader) {
        rule
          .use('style-loader')
          .loader(require.resolve('style-loader'))
          .options({
            base: opts.styleLoader.base || 0,
            convertToAbsoluteUrls: true,
          });
      } else {
        rule
          .use('extract-css-loader')
          .loader(require('mini-css-extract-plugin').loader)
          .options({
            publicPath: isDev ? '/' : opts.cssPublicPath,
            hmr: isDev,
          });
      }
    }
    // https://github.com/webpack-contrib/mini-css-extract-plugin/issues/90
    const cssLoader =
      opts.cssLoaderVersion === 2
        ? opts.ssr
          ? 'css-loader/locals'
          : 'css-loader'
        : opts.ssr
        ? 'css-loader-1/locals'
        : 'css-loader-1';

    if (isDev && cssModules && opts.generateCssModulesTypings) {
      rule
        .use('css-modules-typescript-loader')
        .loader(require.resolve('css-modules-typescript-loader'));
    }

    rule
      .use('css-loader')
      .loader(require.resolve(cssLoader))
      .options({
        ...cssOpts,
        ...(cssModules ? cssModulesConfig : {}),
      });

    rule
      .use('postcss-loader')
      .loader(require.resolve('postcss-loader'))
      .options(postcssOptions);

    if (less) {
      rule
        .use('less-loader')
        .loader(require.resolve('less-loader'))
        .options(lessOptions);
    }

    if (sass && hasSassLoader) {
      rule
        .use('sass-loader')
        .loader(require.resolve('sass-loader'))
        .options(opts.sass);
    }

    // 开始添加 stylus 支持
    if (stylus) {
      const {
        loader: stylusLoader = 'stylus-loader',
        options: stylusOptions = { preferPathResolver: 'webpack' },
        poststylus,
      } = opts.stylus || {};

      // 避免项目启动时出现异常 Error: Cannot find module 'stylus-loader'
      let stylusLoaderPath;
      try {
        stylusLoaderPath = require.resolve(stylusLoader);
        // eslint-disable-next-line no-empty
      } catch (e) {}

      // 如果安装了 stylus-loader 模块
      if (stylusLoaderPath) {
        rule
          .use('stylus-loader')
          .loader(stylusLoaderPath)
          .options(stylusOptions);

        // 如果使用了 poststylus, 需要移除 postcss-loader
        if (poststylus) {
          rule.delete('postcss-loader');
        }
      }
    }
  }

  if (opts.cssModulesExcludes) {
    opts.cssModulesExcludes.forEach((exclude, index) => {
      const rule = `cssModulesExcludes_${index}`;
      const config = webpackConfig.module.rule(rule).test(filePath => {
        if (exclude instanceof RegExp) {
          return exclude.test(filePath);
        } else {
          return filePath.indexOf(exclude) > -1;
        }
      });
      const ext = extname(exclude).toLowerCase();
      applyCSSRules(config, {
        less: ext === '.less',
        sass: ext === '.sass' || ext === '.scss',
        stylus: ext === '.styl' || ext === '.stylus',
      });
    });
  }

  if (opts.cssModulesWithAffix) {
    applyCSSRules(webpackConfig.module.rule('.module.css').test(/\.module\.css$/), {
      cssModules: true,
    });
    applyCSSRules(webpackConfig.module.rule('.module.less').test(/\.module\.less$/), {
      cssModules: true,
      less: true,
    });
    applyCSSRules(webpackConfig.module.rule('.module.sass').test(/\.module\.(sass|scss)$/), {
      cssModules: true,
      sass: true,
    });
    applyCSSRules(webpackConfig.module.rule('.module.stylus').test(/\.module\.styl(us)?$/), {
      cssModules: true,
      stylus: true,
    });
  }

  function cssExclude(filePath) {
    if (/node_modules/.test(filePath)) {
      return true;
    }
    if (opts.cssModulesWithAffix) {
      if (/\.module\.(css|less|sass|scss|styl(us)?)$/.test(filePath)) return true;
    }
    if (opts.cssModulesExcludes) {
      for (const exclude of opts.cssModulesExcludes) {
        if (filePath.indexOf(exclude) > -1) return true;
      }
    }
    return false;
  }

  applyCSSRules(
    webpackConfig.module
      .rule('css')
      .test(/\.css$/)
      .exclude.add(cssExclude)
      .end(),
    {
      cssModules: !opts.disableCSSModules,
    },
  );
  applyCSSRules(
    webpackConfig.module
      .rule('css-in-node_modules')
      .test(/\.css$/)
      .include.add(/node_modules/)
      .end(),
    {},
  );
  applyCSSRules(
    webpackConfig.module
      .rule('less')
      .test(/\.less$/)
      .exclude.add(cssExclude)
      .end(),
    {
      cssModules: !opts.disableCSSModules,
      less: true,
    },
  );
  applyCSSRules(
    webpackConfig.module
      .rule('less-in-node_modules')
      .test(/\.less$/)
      .include.add(/node_modules/)
      .end(),
    {
      less: true,
    },
  );
  applyCSSRules(
    webpackConfig.module
      .rule('sass')
      .test(/\.(sass|scss)$/)
      .exclude.add(cssExclude)
      .end(),
    {
      cssModules: !opts.disableCSSModules,
      sass: true,
    },
  );
  applyCSSRules(
    webpackConfig.module
      .rule('sass-in-node_modules')
      .test(/\.(sass|scss)$/)
      .include.add(/node_modules/)
      .end(),
    {
      sass: true,
    },
  );
  applyCSSRules(
    webpackConfig.module
      .rule('stylus')
      .test(/\.styl(us)?$/)
      .exclude.add(cssExclude)
      .end(),
    {
      cssModules: !opts.disableCSSModules,
      stylus: true,
    },
  );
  applyCSSRules(
    webpackConfig.module
      .rule('stylus-in-node_modules')
      .test(/\.styl(us)?$/)
      .include.add(/node_modules/)
      .end(),
    {
      stylus: true,
    },
  );

  const hash = !isDev && opts.hash ? '.[contenthash:8]' : '';
  if (!opts.ssr && !opts.styleLoader) {
    webpackConfig.plugin('extract-css').use(require('mini-css-extract-plugin'), [
      {
        filename: `[name]${hash}.css`,
        chunkFilename: `[name]${hash}.chunk.css`,
      },
    ]);
  }
}
