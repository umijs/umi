import { join } from 'path';

export default {
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
      join(__dirname, '../packages/umi-plugin-react/lib/index.js'),
      {
        antd: true,
        links: [
          {
            rel: 'stylesheet',
            href: 'https://unpkg.alibaba-inc.com/antd@3.11.0/dist/antd.min.css',
          },
        ],
        headScripts: [
          { content: 'window.g_umiUIPlugins = [];' },
          {
            src: 'https://unpkg.alibaba-inc.com/react@16.7.0-alpha.2/umd/react.development.js',
          },
          {
            src:
              'https://unpkg.alibaba-inc.com/react-dom@16.7.0-alpha.2/umd/react-dom.development.js',
          },
          {
            src: 'https://unpkg.alibaba-inc.com/moment@2.22.2/min/moment.min.js',
          },
          {
            src: 'https://unpkg.alibaba-inc.com/antd@3.11.0/dist/antd.min.js',
          },
          { src: 'https://unpkg.alibaba-inc.com/sockjs-client@1.3.0/dist/sockjs.min.js' },
        ],
      },
    ],
  ],
};
