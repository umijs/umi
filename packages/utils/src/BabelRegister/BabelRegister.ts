import { winPath, createDebug } from '../';

const debug = createDebug('umi:utils:BabelRegister');

export default class BabelRegister {
  only: {
    [key: string]: string[];
  } = {};

  constructor() {}

  setOnlyMap({ key, value }: { key: string; value: string[] }) {
    debug(`set ${key} of only map:`);
    debug(value);
    this.only[key] = value;
    this.register();
  }

  register() {
    const only = Object.keys(this.only)
      .reduce((memo, key) => {
        return memo.concat(this.only[key]);
      }, [] as string[])
      .map(winPath);
    require('@babel/register')({
      presets: [require.resolve('@umijs/babel-preset-umi/node')],
      ignore: [/node_modules/],
      only,
      extensions: ['.jsx', '.js', '.ts', '.tsx'],
      babelrc: false,
      cache: false,
    });
  }
}
