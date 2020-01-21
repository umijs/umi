import { createDebug, lodash, winPath } from '../';

const debug = createDebug('umi:utils:BabelRegister');

export default class BabelRegister {
  only: Record<string, string[]> = {};

  constructor() {}

  setOnlyMap({ key, value }: { key: string; value: string[] }) {
    debug(`set ${key} of only map:`);
    debug(value);
    this.only[key] = value;
    this.register();
  }

  register() {
    const only = lodash.uniq(
      Object.keys(this.only)
        .reduce<string[]>((memo, key) => {
          return memo.concat(this.only[key]);
        }, [])
        .map(winPath),
    );
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
