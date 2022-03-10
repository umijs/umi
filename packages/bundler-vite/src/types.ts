import { Options as LegacyOptions } from '../compiled/@vitejs/plugin-legacy';
import type { PluginVisualizerOptions } from '../compiled/rollup-plugin-visualizer';
import type { Plugin, ProxyOptions } from '../compiled/vite';

export enum Env {
  development = 'development',
  production = 'production',
}

export enum JSMinifier {
  terser = 'terser',
  esbuild = 'esbuild',
  none = 'none',
}

export interface ICopy {
  from: string;
  to: string;
}

export type IBabelPlugin = string | [string, { [key: string]: any }];

export interface IConfig {
  alias?: Record<string, string>;
  analyze?: PluginVisualizerOptions;
  autoCSSModules?: boolean;
  autoprefixer?: any;
  copy?: ICopy[] | string[];
  define?: { [key: string]: any };
  externals?: Record<string, string>;
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
  legacy?: LegacyOptions | boolean;
  outputPath?: string;
  polyfill?: { imports: string[] };
  postcssLoader?: { postcssOptions: any };
  proxy?: { [key: string]: ProxyOptions };
  publicPath?: string;
  svgr?: { [key: string]: any };
  svgo?: { [key: string]: any } | false;
  targets?: { [key: string]: any };
  [key: string]: any;
}
