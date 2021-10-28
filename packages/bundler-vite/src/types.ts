import { Options as LegacyOptions } from '@vitejs/plugin-legacy';
import { TransformOptions } from '@umijs/bundler-utils/compiled/esbuild';

export enum Env {
  development = 'development',
  production = 'production',
}

export enum JSMinifier {
  terser = 'terser',
  esbuild = 'esbuild',
}

type IBabelPlugin = string | [string, { [key: string]: any }];

export interface IConfig {
  alias?: Record<string, string>;
  define?: { [key: string]: any };
  devtool?: any;
  externals?: Record<string, string>;
  extraBabelPlugins?: IBabelPlugin[];
  extraBabelPresets?: IBabelPlugin[];
  extraPostCSSPlugins?: any[];
  hash?: any;
  jsMinifier?: JSMinifier | boolean;
  jsMinifierOptions?: { [key: string]: any };
  legacy?: LegacyOptions | boolean;
  outputPath?: string;
  publicPath?: string;
  svgr?: TransformOptions;
  targets?: { [key: string]: any };
  [key: string]: any;
}
