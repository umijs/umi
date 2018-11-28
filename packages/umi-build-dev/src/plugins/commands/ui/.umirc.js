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
      },
    ],
  ],
};
