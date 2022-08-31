import type { Config as SwcConfig } from '@swc/core';
import type { HttpsServerOptions } from '@umijs/bundler-utils';
import type { Options as HPMOptions } from '../compiled/http-proxy-middleware';
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
  parcelCSS = 'parcelCSS',
  none = 'none',
}

export interface ICopy {
  from: string;
  to: string;
}

type WebpackConfig = Required<Configuration>;
type IBabelPlugin =
  | Function
  | string
  | [string, { [key: string]: any }]
  | [string, { [key: string]: any }, string];

export interface DeadCodeParams {
  patterns?: string[];
  exclude?: string[];
  failOnHint?: boolean;
  detectUnusedFiles?: boolean;
  detectUnusedExport?: boolean;
  context?: string;
}

type HPMFnArgs = Parameters<NonNullable<HPMOptions['onProxyReq']>>;
export interface ProxyOptions extends HPMOptions {
  target?: string;
  context?: string | string[];
  bypass?: (
    ...args: [HPMFnArgs[1], HPMFnArgs[2], HPMFnArgs[3]]
  ) => string | boolean | null | void;
}

export interface IConfig {
  alias?: Record<string, string>;
  autoCSSModules?: boolean;
  base?: string;
  chainWebpack?: Function;
  copy?: ICopy[] | string[];
  cssLoader?: { [key: string]: any };
  cssLoaderModules?: { [key: string]: any };
  cssMinifier?: `${CSSMinifier}`;
  cssMinifierOptions?: { [key: string]: any };
  define?: { [key: string]: any };
  depTranspiler?: `${Transpiler}`;
  devtool?: Config.DevTool;
  deadCode?: DeadCodeParams;
  https?: HttpsServerOptions;
  externals?: WebpackConfig['externals'];
  esm?: { [key: string]: any };
  extraBabelPlugins?: IBabelPlugin[];
  extraBabelPresets?: IBabelPlugin[];
  extraBabelIncludes?: Array<string | RegExp>;
  extraPostCSSPlugins?: any[];
  hash?: boolean;
  ignoreMomentLocale?: boolean;
  jsMinifier?: `${JSMinifier}`;
  jsMinifierOptions?: { [key: string]: any };
  lessLoader?: { [key: string]: any };
  outputPath?: string;
  postcssLoader?: { [key: string]: any };
  proxy?: { [key: string]: ProxyOptions } | ProxyOptions[];
  publicPath?: string;
  purgeCSS?: { [key: string]: any };
  sassLoader?: { [key: string]: any };
  srcTranspiler?: Transpiler;
  styleLoader?: { [key: string]: any };
  svgr?: { [key: string]: any };
  svgo?: { [key: string]: any } | false;
  targets?: { [key: string]: any };
  writeToDisk?: boolean;
  babelLoaderCustomize?: string;
  [key: string]: any;
}

export interface SwcOptions extends SwcConfig {
  sync?: boolean;
  parseMap?: boolean;
}
