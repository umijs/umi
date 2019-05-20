import { IConfig } from 'umi-types';
export default {
  treeShaking: true,
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    [
      'umi-plugin-react',
      {
        antd: false,
        dva: false,
        dynamicImport: false,
        title: 'umi-ts',
        dll: false,
      },
    ],
  ],
  routes: [
    {
      path: '/aa',
      component: 'A',
      routes: [
        {
          path: '/aa/xx/sdad/demo',
          component: './aa/xx/sdad/Demo',
        },
      ],
    },
    {
      path: '/',
      component: 'index',
    },
  ],
} as IConfig;
