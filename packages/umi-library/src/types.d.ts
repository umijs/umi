export type BundleType = 'rollup' | 'babel';

interface IBundleTypeOutput {
  type: BundleType;
  file?: string;
}

interface IEsm extends IBundleOptions {
  mjs?: boolean;
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
  esm?: IEsm | false;
  cjs?: IBundleTypeOutput | false;
  umd?: IUmd | false;
  extraBabelPlugins?: any[];
  extraBabelPresets?: any[];
  extraPostCSSPlugins?: any[];
  cssModules?: boolean | Object;
  autoprefixer?: Object;
  namedExports?: IStringArrayObject;
  runtimeHelpers?: boolean;
  overridesByEntry?: {
    [entry: string]: any;
  },
}

export interface IOpts {
  cwd: string;
  watch?: boolean;
  buildArgs?: IBundleOptions;
}
