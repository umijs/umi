import { join } from 'path';
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
  },
  plugins: [
    [
      'umi-plugin-react',
      {
        antd: true,
        locale: {
          default: 'zh-CN',
          baseNavigator: false,
        },
        links: [
          {
            rel: 'stylesheet',
            href: 'https://gw.alipayobjects.com/os/lib/antd/3.20.7/dist/antd.min.css',
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
            src: 'https://gw.alipayobjects.com/os/lib/antd/3.20.7/dist/antd.min.js',
          },
          { src: 'https://gw.alipayobjects.com/os/lib/sockjs-client/1.3.0/dist/sockjs.min.js' },
        ],
      },
    ],
  ],
};

export default config;
