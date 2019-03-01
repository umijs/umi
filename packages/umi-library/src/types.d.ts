export type BundleType = 'rollup' | 'babel';

interface IBundleTypeOutput {
  type: BundleType,
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
}

export interface IBundleOptions {
  entry?: string | string[];
  esm?: IBundleTypeOutput | false;
  cjs?: IBundleTypeOutput | false;
  umd?: IUmd | false;
  extraBabelPlugins?: any[];
  extraBabelPresets?: any[];
  extraPostCSSPlugins?: any[];
  cssModules?: boolean | Object;
  autoprefixer?: Object;
  namedExports?: IStringArrayObject;
}

export interface IOpts {
  cwd: string,
  watch?: boolean,
  buildArgs?: IBundleOptions,
}
