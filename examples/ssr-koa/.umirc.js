// ref: https://umijs.org/config/
export default {
  treeShaking: true,
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    [
      'umi-plugin-react',
      {
        title: 'ssr-koa',
        routes: {
          exclude: [/components\//],
        },
      },
    ],
  ],
  define: {
    __isBrowser__: true,
  },
  extraBabelPlugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          'umi/link': './node_modules/umi/lib/link.js',
          'umi/dynamic': './node_modules/umi/lib/dynamic.js',
          'umi/navlink': './node_modules/umi/lib/navlink.js',
          'umi/redirect': './node_modules/umi/lib/redirect.js',
          'umi/prompt': './node_modules/umi/lib/prompt.js',
          'umi/router': './node_modules/umi/lib/router.js',
          'umi/withRouter': './node_modules/umi/lib/withRouter.js',
          'umi/_renderRoutes': './node_modules/umi/lib/renderRoutes.js',
          'umi/_createHistory': './node_modules/umi/lib/createHistory.js',
          'umi/_runtimePlugin': './node_modules/umi/lib/runtimePlugin.js',
        },
      },
    ],
  ],
};
