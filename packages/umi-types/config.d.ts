// https://umijs.org/config/
import { ExternalsElement, Condition } from 'webpack';
import * as IWebpackChainConfig from 'webpack-chain';
import { ReactNode } from 'react';
import { IChangeWebpackConfigFunc } from './index';

export type IPlugin<T = any> = string | [string, T];

export interface IRoute {
  path?: string;
  component?: ReactNode;
  routes?: IRoute[];
  Routes?: string[];
  redirect?: string;
  [key: string]: any;
}

export interface IExportStaticOpts {
  htmlSuffix?: boolean;
  dynamicRoot?: boolean;
}

// sorted by alphabet
export interface IAFWebpackConfig {
  alias?: object; // https://webpack.js.org/configuration/resolve/#resolve-alias
  autoprefixer?: object; // https://github.com/ai/browserslist
  babel?: object;
  browserslist?: string[]; // https://github.com/ai/browserslist
  chainConfig?: any; // https://github.com/mozilla-neutrino/webpack-chain
  copy?: any[]; // https://github.com/webpack-contrib/copy-webpack-plugin
  cssLoaderOptions?: any; // https://github.com/webpack-contrib/css-loader
  cssModulesExcludes?: string[];
  cssModulesWithAffix?: boolean;
  cssnano?: object;
  cssPublicPath?: string;
  generateCssModulesTypings?: boolean;
  define?: object;
  devServer?: object; // https://webpack.js.org/configuration/dev-server/#devserver
  devtool?: string | false; // https://webpack.js.org/configuration/devtool/
  disableCSSModules?: boolean;
  disableCSSSourceMap?: boolean;
  disableDynamicImport?: boolean;
  disableGlobalVariables?: boolean;
  cssLoaderVersion?: 1 | 2;
  entry?: any;
  env?: object;
  es5ImcompatibleVersions?: boolean;
  externals?: ExternalsElement; // https://webpack.js.org/configuration/externals/
  extraBabelIncludes?: Condition[]; // https://webpack.js.org/configuration/module/#condition
  extraBabelPlugins?: any[];
  extraBabelPresets?: any[];
  extraPostCSSPlugins?: any[];
  hash?: boolean;
  ignoreMomentLocale?: boolean;
  lessLoaderOptions?: any; // https://github.com/webpack-contrib/less-loader
  manifest?: any; // https://www.npmjs.com/package/webpack-manifest-plugin
  minimizer?: 'uglifyjs' | 'terserjs';
  outputPath?: string;
  proxy?: object | [object, Function]; // https://webpack.js.org/configuration/dev-server/#devserver-proxy
  publicPath?: string;
  sass?: object; // https://github.com/sass/node-sass#options
  terserJSOptions?: object;
  theme?: string | object;
  tsConfigFile?: string;
  typescript?: object;
  uglifyJSOptions?: object;
  urlLoaderExcludes?: Condition[];
}

type WhitelistOption = string | RegExp;
export type IExportSSROpts =
  | {
      /** not external library, https://github.com/liady/webpack-node-externals#optionswhitelist- */
      externalWhitelist?: WhitelistOption[];
      /** webpack-node-externals config */
      nodeExternalsOpts?: object;
      /** client chunkMaps manifest, default: ssr-client-mainifest.json */
      manifestFileName?: string;
      /** disable ssr external */
      disableExternal?: boolean;
      /** disable ssr external, build all modules in `umi.server.js` */
      disableExternalWhiteList?: string[] | object;
    }
  | boolean;

export interface IMockOpts {
  exclude?: string[] | string;
}

interface IConfig extends IAFWebpackConfig {
  // basic config
  // sorted by alphabet
  block?: object;
  chainWebpack?: IChangeWebpackConfigFunc<IWebpackChainConfig, IAFWebpackConfig>; // https://github.com/mozilla-neutrino/webpack-chain
  context?: object;
  disableRedirectHoist?: boolean;
  exportStatic?: boolean | IExportStaticOpts;
  outputPath?: string;
  plugins?: IPlugin[];
  routes?: IRoute[] | null;
  runtimePublicPath?: boolean;
  singular?: boolean;
  mock?: IMockOpts;
  treeShaking?: boolean;
  dva?: any;
  locale?: any;

  // implemented in plugins
  base?: string;
  history?: 'browser' | 'hash' | 'memory';
  mountElementId?: string;
  targets?: {
    [key: string]: number;
  };
  ssr?: IExportSSROpts;
}

export default IConfig;
