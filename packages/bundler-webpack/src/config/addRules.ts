import Config from '../../compiled/webpack-5-chain';
import { IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
}

export function addRules(opts: IOpts) {
  const { config } = opts;
  return config;
}
