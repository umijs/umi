import { join } from 'path';
import LessThemePlugin from 'webpack-less-theme-plugin';
import { IConfig } from 'umi-types';

const config: IConfig = {
  history: 'hash',
  externals: {
    react: 'window.React',
    'react-dom': 'window.ReactDOM',
    antd: 'window.antd',
  },
  theme: {
    'primary-color': '#fba008',
    'link-color': 'rgba(0, 0, 0, 45)',
    'heading-color': 'rgba(0, 0, 0, 85)',
  },
  routes: [
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
      path: '/',
      component: '../layouts',
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
            src:
              'https://gw.alipayobjects.com/os/lib/react/16.7.0-alpha.2/umd/react.development.js',
          },
          {
            src:
              'https://gw.alipayobjects.com/os/lib/react-dom/16.7.0-alpha.2/umd/react-dom.development.js',
          },
          {
            src: 'https://gw.alipayobjects.com/os/lib/moment/2.22.2/min/moment.min.js',
          },
          {
            src: 'https://gw.alipayobjects.com/os/lib/antd/4.0.0-alpha.0/dist/antd.min.js',
          },
          { src: 'https://gw.alipayobjects.com/os/lib/sockjs-client/1.3.0/dist/sockjs.min.js' },
        ],
      },
    ],
  ],
  chainWebpack(config, { webpack }) {
    config.plugin('webpack-less-theme').use(
      new LessThemePlugin({
        theme: join(__dirname, './src/styles/parameters.less'),
      }),
    );
  },
};

export default config;
