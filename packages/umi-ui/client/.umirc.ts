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
      join(__dirname, '../../umi-plugin-react/lib/index.js'),
      {
        antd: true,
        links: [
          {
            rel: 'stylesheet',
            href: 'https://unpkg.com/antd@3.11.0/dist/antd.min.css',
          },
        ],
        headScripts: [
          {
            src: 'https://unpkg.com/react@16.7.0-alpha.2/umd/react.development.js',
          },
          {
            src: 'https://unpkg.com/react-dom@16.7.0-alpha.2/umd/react-dom.development.js',
          },
          {
            src: 'https://unpkg.com/moment@2.22.2/min/moment.min.js',
          },
          {
            src: 'https://unpkg.com/antd@3.11.0/dist/antd.min.js',
          },
          { src: 'https://unpkg.com/sockjs-client@1.3.0/dist/sockjs.min.js' },
        ],
      },
    ],
  ],
};

export default config;
