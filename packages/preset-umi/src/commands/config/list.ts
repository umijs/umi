// TODO: bundler-vite ?
import type { IConfig } from '@umijs/bundler-webpack/dist/types';
import { chalk } from '@umijs/utils';

export function list(config: IConfig, name?: string) {
  const getValue = (value: any) => {
    if (typeof value !== 'function') {
      return value;
    }
    return chalk.yellow('The value data type does not support the view');
  };
  const print = (key: string) => {
    console.log(` - ${chalk.blue(`[key: ${key}]`)}`, getValue(config[key]));
    console.log();
  };
  console.log();
  console.log(`  Configs:`);
  console.log();
  if (name) {
    if (!config[name as string]) {
      // current key not existed
      throw new Error(`key ${name} not found`);
    }
    print(name as string);
  } else {
    // list all
    Object.keys(config).forEach((key) => {
      print(key);
    });
  }

  console.log();
}
