import { IConfig } from '@umijs/bundler-vite/src/types';

export default {
  legacy: {
    targets: ['defaults', 'not IE 11'],
  },
  jsMinifier: false,
  // extraBabelPlugins: ['transform-remove-console']
  // jsMinifier: 'terser',
  // jsMinifierOptions: {
  //   compress: {
  //     pure_funcs: ['console.log']
  //   }
  // },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  autoCSSModules: true,
} as IConfig;
