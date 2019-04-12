import { Config as IDoczConfig } from 'docz-core';

export type BundleType = 'rollup' | 'babel';

interface IBundleTypeOutput {
  type: BundleType;
  file?: string;
}

interface ICjs extends IBundleTypeOutput {
  minify?: boolean;
}

interface IEsm extends IBundleTypeOutput {
  mjs?: boolean;
  minify?: boolean;
}

interface IStringObject {
  [prop: string]: string;
}

interface IStringArrayObject {
  [prop: string]: string[];
}

interface IUmd {
  globals?: IStringObject;
  name?: string;
  minFile?: boolean;
  file?: string;
}

export interface IBundleOptions {
  entry?: string | string[];
  file?: string;
  esm?: BundleType | IEsm | false;
  cjs?: BundleType | ICjs | false;
  umd?: IUmd | false;
  extraBabelPlugins?: any[];
  extraBabelPresets?: any[];
  extraPostCSSPlugins?: any[];
  cssModules?: boolean | Object;
  autoprefixer?: Object;
  namedExports?: IStringArrayObject;
  runtimeHelpers?: boolean;
  target?: 'node' | 'browser';
  overridesByEntry?: {
    [entry: string]: any;
  };
  doc?: IDoczConfig;
  replace?: {
    [value: string]: any;
  };
}

export interface IOpts {
  cwd: string;
  watch?: boolean;
  buildArgs?: IBundleOptions;
}
