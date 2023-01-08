import type { Options as SwcConfig } from '@swc/core';
import type { HttpsServerOptions, ProxyOptions } from '@umijs/bundler-utils';
import webpack, { Configuration } from '../compiled/webpack';
import Config from '../compiled/webpack-5-chain';
import type { TransformOptions as EsbuildOptions } from '@umijs/bundler-utils/compiled/esbuild';
import type { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

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

export interface IConfig {
  alias?: Record<string, string>;
  autoCSSModules?: boolean;
  base?: string;
  chainWebpack?: {
    (
      memo: Config,
      args: {
        env: keyof typeof Env;
        webpack: typeof webpack;
      },
    ): void;
  };
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
  srcTranspiler?: `${Transpiler}`;
  srcTranspilerOptions?: ISrcTranspilerOpts;
  styleLoader?: { [key: string]: any };
  svgr?: { [key: string]: any };
  svgo?: { [key: string]: any } | false;
  targets?: { [key: string]: any };
  writeToDisk?: boolean;
  babelLoaderCustomize?: string;
  analyze?: BundleAnalyzerPlugin.Options;
  [key: string]: any;
}

export interface ISrcTranspilerOpts {
  swc?: Partial<SwcConfig>;
  esbuild?: Partial<EsbuildOptions>;
}

export interface ISwcPluginOpts {
  enableAutoCssModulesPlugin?: boolean;
}

export interface SwcOptions extends SwcConfig, ISwcPluginOpts {
  sync?: boolean;
  parseMap?: boolean;
  excludeFiles?: Array<string | RegExp>;
  mergeConfigs?: Partial<SwcConfig>;
}
