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

type WebpackConfig = Required<Configuration>;
type IBabelPlugin = string | [string, { [key: string]: any }];

export interface IConfig {
  alias?: Record<string, string>;
  chainWebpack?: Function;
  devtool?: any;
  externals?: WebpackConfig['externals'];
  extraBabelPlugins?: IBabelPlugin[];
  extraBabelPresets?: IBabelPlugin[];
  hash?: any;
  outputPath?: string;
  publicPath?: string;
  srcTranspiler?: Transpiler;
  depTranspiler?: Transpiler;
  [key: string]: any;
}
