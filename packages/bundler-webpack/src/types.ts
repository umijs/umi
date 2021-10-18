import type { Options as ProxyOptions } from '../compiled/http-proxy-middleware';
import { Configuration } from '../compiled/webpack';
import Config from '../compiled/webpack-5-chain';

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

export interface ICopy {
  from: string;
  to: string;
}

type WebpackConfig = Required<Configuration>;
type IBabelPlugin = Function | string | [string, { [key: string]: any }];
export interface IConfig {
  alias?: Record<string, string>;
  chainWebpack?: Function;
  copy?: ICopy[] | string[];
  cssLoader?: { [key: string]: any };
  cssLoaderModules?: { [key: string]: any };
  cssMinifier?: CSSMinifier;
  cssMinifierOptions?: { [key: string]: any };
  define?: { [key: string]: any };
  depTranspiler?: Transpiler;
  devtool?: Config.DevTool;
  externals?: WebpackConfig['externals'];
  extraBabelPlugins?: IBabelPlugin[];
  extraBabelPresets?: IBabelPlugin[];
  extraPostCSSPlugins?: any[];
  hash?: boolean;
  ignoreMomentLocale?: boolean;
  jsMinifier?: JSMinifier;
  jsMinifierOptions?: { [key: string]: any };
  lessLoader?: { [key: string]: any };
  outputPath?: string;
  postcssLoader?: { [key: string]: any };
  proxy?: { [key: string]: ProxyOptions };
  publicPath?: string;
  purgeCSS?: { [key: string]: any };
  sassLoader?: { [key: string]: any };
  srcTranspiler?: Transpiler;
  styleLoader?: { [key: string]: any };
  svgr?: { [key: string]: any };
  svgo?: { [key: string]: any } | false;
  targets?: { [key: string]: any };
  writeToDisk?: boolean;
  [key: string]: any;
}
