import { logger } from '@umijs/utils';
import { IConfig } from './types';

interface IOpts {
  cwd: string;
  config: IConfig;
  entry: Record<string, string>;
}

export async function dev(opts: IOpts) {
  logger.info(`dev`, JSON.stringify(opts));
}
