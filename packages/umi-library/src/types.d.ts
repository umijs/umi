
interface IBundleTypeOutput {
  type: 'rollup' | 'babel',
  dir?: string;
}

interface IStringObject {
  [prop: string]: string;
}

interface IUmd {
  globals?: IStringObject;
  name?: string;
  file?: string;
}

export interface IBundleOptions {
  entry?: string | string[];
  esm?: IBundleTypeOutput | false;
  cjs?: IBundleTypeOutput | false;
  umd?: IUmd | false;
}

export interface IOpts {
  cwd: string,
  watch?: boolean,
  buildArgs?: IBundleOptions,
}
