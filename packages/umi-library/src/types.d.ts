
interface IBundleTypeOutput {
  type: 'rollup' | 'babel',
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

type BabelOpt = string | [string, object];

export interface IBundleOptions {
  entry?: string | string[];
  esm?: IBundleTypeOutput | false;
  cjs?: IBundleTypeOutput | false;
  umd?: IUmd | false;
  extraBabelPlugins?: BabelOpt[];
  extraBabelPresets?: BabelOpt[];
  extraPostCSSPlugins?: any[];
  cssModules?: boolean | Object;
  autoprefixer: Object;
  namedExports?: IStringArrayObject;
}

export interface IOpts {
  cwd: string,
  watch?: boolean,
  buildArgs?: IBundleOptions,
}
