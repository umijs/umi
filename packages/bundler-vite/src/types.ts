export enum Env {
  development = 'development',
  production = 'production',
}

export enum JSMinifier {
  terser = 'terser',
  swc = 'swc',
  esbuild = 'esbuild',
  uglifyJs = 'uglifyJs',
  none = 'none',
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
  jsMinifier?: JSMinifier;
  jsMinifierOptions?: { [key: string]: any };
  outputPath?: string;
  publicPath?: string;
  [key: string]: any;
}
