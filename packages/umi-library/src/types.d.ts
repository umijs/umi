
interface IBundleTypeOutput {
  type: 'rollup' | 'babel',
}

interface IStringObject {
  [prop: string]: string;
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
}

export interface IOpts {
  cwd: string,
  watch?: boolean,
  buildArgs?: IBundleOptions,
}
