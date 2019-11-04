import { join } from 'path';
import slash from 'slash2';
import LessThemePlugin from 'webpack-less-theme-plugin';
import { IConfig } from 'umi-types';
import { dark } from 'umi-ui-theme';

const { NODE_ENV } = process.env;

const uglifyJSOptions =
  NODE_ENV === 'production'
    ? {
        uglifyOptions: {
          // remove console.* except console.error
          compress: {
            pure_funcs: ['console.log', 'console.info'],
          },
        },
      }
    : {};

const config: IConfig = {
  history: 'browser',
  hash: NODE_ENV === 'production',
  treeShaking: true,
  uglifyJSOptions,
  externals: {
    react: 'window.React',
    'react-dom': 'window.ReactDOM',
    antd: 'window.antd',
    xterm: 'window.Terminal',
  },
  theme: dark,
  generateCssModulesTypings: true,
  routes: [
    {
      path: '/project',
      component: '../layouts/Project',
      routes: [
        {
          path: '/project/select',
          component: '../pages/project',
        },
        {
          component: '404',
        },
      ],
    },
    {
      // for plugins to patch routes into dashboard identification
      key: 'dashboard',
      path: '/',
      component: '../layouts/Dashboard',
      routes: [
        {
          path: '/',
          component: '../pages/index',
        },
        {
          component: '404',
        },
      ],
    },
    {
      component: '404',
    },
  ],
  plugins: [
    [
      join(__dirname, '../../umi-plugin-react/lib/index.js'),
      {
        dva: true,
        antd: false,
        dynamicImport: {
          webpackChunkName: true,
          loadingComponent: './components/Loading',
        },
        title: {
          defaultTitle: 'Umi UI',
          useLocale: true,
        },
        locale: {
          default: 'zh-CN',
          antd: true,
        },
        routes: {
          exclude: [/models\//, /component\//, /components\//],
        },
        links: [
          {
            rel: 'stylesheet',
            href: '//gw.alipayobjects.com/os/lib/xterm/4.1.0/css/xterm.css',
          },
        ],
        headScripts: [
          // polyfill
          {
            src:
              '//polyfill.alicdn.com/polyfill.min.js?features=default,es2015,es2016,es2017,RegeneratorRuntime,IntersectionObserver,NodeList.prototype.forEach',
          },
          {
            src: `//gw.alipayobjects.com/os/lib/??react/16.8.6/umd/react.${
              NODE_ENV === 'development' ? 'development' : 'production.min'
            }.js,react-dom/16.8.6/umd/react-dom.${
              NODE_ENV === 'development' ? 'development' : 'production.min'
            }.js`,
          },
          {
            src: '//gw.alipayobjects.com/os/lib/moment/2.22.2/min/moment.min.js',
          },
          {
            src: '//gw.alipayobjects.com/os/lib/antd/4.0.0-alpha.6/dist/antd.min.js',
          },
          { src: '//gw.alipayobjects.com/os/lib/sockjs-client/1.3.0/dist/sockjs.min.js' },
          { src: '//gw.alipayobjects.com/os/lib/xterm/4.1.0/lib/xterm.js' },
        ],
      },
    ],
  ],
  cssLoaderOptions: {
    modules: true,
    getLocalIdent: (
      context: {
        resourcePath: string;
      },
      _: string,
      localName: string,
    ) => {
      if (
        context.resourcePath.includes('node_modules') ||
        context.resourcePath.includes('global.less')
      ) {
        return localName;
      }
      const match = context.resourcePath.match(/src(.*)/);

      if (match && match[1]) {
        const umiUiPath = match[1].replace('.less', '');
        const arr = slash(umiUiPath)
          .split('/')
          .map((a: string) => a.replace(/([A-Z])/g, '-$1'))
          .map((a: string) => a.toLowerCase());
        return `umi-ui${arr.join('-')}_${localName}`.replace(/--/g, '-');
      }

      return localName;
    },
  },
  chainWebpack(config, { webpack }) {
    if (NODE_ENV === 'development') {
      config.output.publicPath('http://localhost:8002/');
    }
    config.plugin('webpack-less-theme').use(
      new LessThemePlugin({
        theme: join(__dirname, './src/styles/parameters.less'),
      }),
    );
  },
};

export default config;
