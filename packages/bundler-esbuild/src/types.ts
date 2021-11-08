import { TransformOptions } from '@umijs/bundler-utils/compiled/esbuild';

export enum Env {
  development = 'development',
  production = 'production',
}

export enum JSMinifier {
  terser = 'terser',
  esbuild = 'esbuild',
}

export interface ICopy {
  from: string;
  to: string;
}

export type IBabelPlugin = string | [string, { [key: string]: any }];

export interface IConfig {
  alias?: Record<string, string>;
  autoCSSModules?: boolean;
  autoprefixer?: any;
  copy?: ICopy[] | string[];
  define?: { [key: string]: any };
  extraBabelPlugins?: IBabelPlugin[];
  extraBabelPresets?: IBabelPlugin[];
  extraPostCSSPlugins?: any[];
  extraVitePlugins?: Plugin[];
  hash?: boolean;
  inlineLimit?: number;
  manifest?: boolean;
  jsMinifier?: JSMinifier | boolean;
  jsMinifierOptions?: { [key: string]: any };
  lessLoader?: { lessOptions: any };
  outputPath?: string;
  polyfill?: { imports: string[] };
  postcssLoader?: { postcssOptions: any };
  publicPath?: string;
  svgr?: TransformOptions;
  targets?: { [key: string]: any };
  [key: string]: any;
}
