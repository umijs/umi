import { logger } from '@umijs/utils';
import { IConfig } from './types';

interface IOpts {
  cwd: string;
  entry: Record<string, string>;
  config: IConfig;
  onBuildComplete?: Function;
  clean?: boolean;
}

export async function build(opts: IOpts): Promise<void> {
  logger.info(`build`, JSON.stringify(opts));
}
