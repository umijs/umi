import { join } from 'path';

export default {
  history: 'hash',
  externals: {
    react: 'window.React',
    'react-dom': 'window.ReactDOM',
    dva: 'window.dva',
  },
  plugins: [
    [
      join(__dirname, '../../../../../umi-plugin-react/lib/index.js'),
      {
        antd: true,
        dva: true,
        routes: {
          exclude: [/model/],
        },
        headScripts: [
          { content: 'window.g_umiUIPlugins = [];' },
          {
            src:
              'https://unpkg.com/react@16.7.0-alpha.2/umd/react.development.js',
          },
          {
            src:
              'https://unpkg.com/react-dom@16.7.0-alpha.2/umd/react-dom.development.js',
          },
          { src: 'https://unpkg.com/dva@2.4.1/dist/dva.min.js' },
          { src: 'https://unpkg.com/sockjs-client@1.3.0/dist/sockjs.min.js' },
        ],
      },
    ],
  ],
};
