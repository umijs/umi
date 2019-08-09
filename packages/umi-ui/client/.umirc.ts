import { join } from 'path';
import LessThemePlugin from 'webpack-less-theme-plugin';
import { IConfig } from 'umi-types';

const config: IConfig = {
  history: 'hash',
  externals: {
    react: 'window.React',
    'react-dom': 'window.ReactDOM',
    antd: 'window.antd',
    xterm: 'window.Terminal',
  },
  theme: './src/styles/theme.js',
  routes: [
    {
      path: '/test',
      component: '../layouts/Test',
    },
    {
      path: '/project',
      component: '../layouts/Project',
      routes: [
        {
          path: '/project/select',
          component: '../pages/project',
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
      ],
    },
  ],
  plugins: [
    [
      join(__dirname, '../../umi-plugin-react/lib/index.js'),
      {
        antd: true,
        locale: {
          default: 'zh-CN',
          baseNavigator: false,
        },
        routes: {
          exclude: [/models\//, /component\//, /components\//],
        },
        links: [
          {
            rel: 'stylesheet',
            href: 'https://gw.alipayobjects.com/os/lib/antd/4.0.0-alpha.0/dist/antd.min.css',
          },
        ],
        headScripts: [
          {
            src: 'https://gw.alipayobjects.com/os/lib/react/16.8.6/umd/react.development.js',
          },
          {
            src:
              'https://gw.alipayobjects.com/os/lib/react-dom/16.8.6/umd/react-dom.development.js',
          },
          {
            src: 'https://gw.alipayobjects.com/os/lib/moment/2.22.2/min/moment.min.js',
          },
          {
            src: 'https://gw.alipayobjects.com/os/lib/antd/4.0.0-alpha.0/dist/antd.min.js',
          },
          { src: 'https://gw.alipayobjects.com/os/lib/sockjs-client/1.3.0/dist/sockjs.min.js' },
          { src: 'https://gw.alipayobjects.com/os/lib/xterm/3.14.0/dist/xterm.js' },
        ],
      },
    ],
  ],
  chainWebpack(config, { webpack }) {
    if (process.env.NODE_ENV === 'development') {
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
