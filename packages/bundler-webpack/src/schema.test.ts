import { zod } from '@umijs/utils';
import { getSchemas } from './schema';
import { IConfig } from './types';

const schemas = getSchemas();
const config = {
  alias: {
    umi: 'umi-next',
  },
  chainWebpack: () => {},
  copy: [
    {
      from: '/public',
      to: '/dist',
    },
  ],
  cssLoader: {},
  cssLoaderModules: {},
  cssMinifier: 'esbuild',
  cssMinifierOptions: {},
  define: {},
  deadCode: {},
  https: {},
  depTranspiler: 'esbuild',
  devtool: 'cheap-module-source-map',
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  extraBabelPlugins: ['a', ['b', {}]],
  extraBabelPresets: ['a', ['b', {}]],
  extraPostCSSPlugins: [],
  hash: true,
  ignoreMomentLocale: true,
  jsMinifier: 'esbuild',
  jsMinifierOptions: {},
  lessLoader: {},
  outputPath: 'abc',
  postcssLoader: {},
  proxy: {},
  publicPath: 'abc',
  purgeCSS: {},
  sassLoader: {},
  srcTranspiler: 'esbuild',
  styleLoader: {},
  svgr: {},
  svgo: {},
  targets: {},
  writeToDisk: true,
} as IConfig;

test('normal', () => {
  Object.keys(config).forEach((key: any) => {
    const schema = schemas[key]({ zod });
    // @ts-ignore
    const { error } = schema.safeParse(config[key]);
    expect(error).toBe(undefined);
  });
});
