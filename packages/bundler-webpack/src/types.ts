import { Configuration } from '../compiled/webpack';

export enum Env {
  development = 'development',
  production = 'production',
}

export enum Transpiler {
  babel = 'babel',
  swc = 'swc',
  esbuild = 'esbuild',
  none = 'none',
}

export enum JSMinifier {
  terser = 'terser',
  swc = 'swc',
  esbuild = 'esbuild',
  uglifyJs = 'uglifyJs',
  none = 'none',
}

export enum CSSMinifier {
  esbuild = 'esbuild',
  cssnano = 'cssnano',
  none = 'none',
}

type WebpackConfig = Required<Configuration>;
type IBabelPlugin = string | [string, { [key: string]: any }];

export interface IConfig {
  alias?: Record<string, string>;
  chainWebpack?: Function;
  cssLoader?: { [key: string]: any };
  cssLoaderModules?: { [key: string]: any };
  cssMinifier?: CSSMinifier;
  cssMinifierOptions?: { [key: string]: any };
  define?: { [key: string]: any };
  depTranspiler?: Transpiler;
  devtool?: any;
  externals?: WebpackConfig['externals'];
  extraBabelPlugins?: IBabelPlugin[];
  extraBabelPresets?: IBabelPlugin[];
  extraPostCSSPlugins?: any[];
  hash?: any;
  ignoreMomentLocale?: boolean;
  jsMinifier?: JSMinifier;
  jsMinifierOptions?: { [key: string]: any };
  lessLoader?: { [key: string]: any };
  outputPath?: string;
  postcssLoader?: { [key: string]: any };
  publicPath?: string;
  purgeCSS?: { [key: string]: any };
  sassLoader?: { [key: string]: any };
  srcTranspiler?: Transpiler;
  styleLoader?: { [key: string]: any };
  targets?: { [key: string]: any };
  writeToDisk?: boolean;
  [key: string]: any;
}
