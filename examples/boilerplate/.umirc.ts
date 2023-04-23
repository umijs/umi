import { defineConfig } from 'umi';
import extraConfig from './extraConfig';

export default defineConfig({
  devtool: 'source-map',
  base: '/foo',
  publicPath: '/foo/',
  // history: { type: 'hash' },
  routes: [
    { path: '/', component: 'index' },
    {
      path: '/users',
      component: 'users',
      routes: [
        {
          path: '/users/foo',
          component: 'users/foo',
        },
        {
          path: '/users/login',
          component: 'users/login',
        },
      ],
    },
    {
      path: '/users/:id',
      component: 'users/$id',
      wrappers: ['@/wrappers/foo', '@/wrappers/bar'],
    },
    {
      path: '/about',
      component: 'about',
    },
    {
      path: '/class-component/:id',
      component: 'class-component',
    },
    {
      path: '*',
      component: '@/components/404',
    },
  ],
  externals: {
    marked: [
      'script https://gw.alipayobjects.com/os/lib/marked/2.0.0/marked.min.js',
      'marked',
    ],
    '@antv/g2': [
      'script https://gw.alipayobjects.com/os/lib/antv/g2/3.5.19/dist/g2.min.js',
      'G2',
    ],
    '@antv/g6': [
      'script https://gw.alipayobjects.com/os/lib/antv/g6/4.1.16/dist/g6.min.js',
      'G6',
    ],
  },
  chainWebpack(memo, { webpack: _ }) {
    memo;
  },
  mfsu: {
    esbuild: true,
  },
  // vite: {},
  deadCode: {
    exclude: ['pages/unused/**'],
  },
  https: {},
  // fastRefresh: false,
  // favicon: 'https://sivers.com/favicon.ico',
  headScripts: [`console.log('head script')`],
  // scripts: [`console.log('script')`],
  npmClient: 'pnpm',
  svgr: {},
  clickToComponent: {
    editor: 'vscode-insiders',
  },
  crossorigin: {},
  // srcTranspiler: 'swc',
  // esmi: {},
  // esm: {},
  lowImport: false,
  title: 'boilerplate - umi 4',
  cssMinifier: 'parcelCSS',
  cssMinifierOptions: {
    targets: {
      chrome: 60,
    },
  },
  cacheDirectoryPath: 'node_modules/.cache1',
  metas: [
    {
      name: 'viewport',
      content: `width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no`,
    },
    {
      'http-equiv': 'X-UA-Compatible',
      content: 'IE=edge,chrome=1',
    },
    {
      name: 'description',
      content: 'umijs',
    },
  ],
  styles: ['//cdn.bootcdn.net/ajax/libs/normalize/8.0.1/normalize.min.css'],
  esbuildMinifyIIFE: true,
  classPropertiesLoose: {},
  ...extraConfig,
});
