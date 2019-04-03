import { join } from 'path';

export default {
  plugins: [
    [
      '../../lib',
      {
        antd: false,
        dva: false,
        dynamicImport: false,
        title: 'umi-examples',
        dll: false,
        routes: {
          exclude: [],
        },
        pwa: {
          // manifestOptions: {
          //   srcPath: join(__dirname, 'pages/manifest.json')
          // },
          // workboxOptions: {
          // }
        },
      },
    ],
  ],
};
