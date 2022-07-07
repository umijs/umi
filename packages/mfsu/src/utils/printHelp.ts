import { logger } from '@umijs/utils';

export function printHelp(e: Error) {
  logger.error(e);
  logger.fatal('如果你需要进交流群，请访问 https://fb.umijs.org');
}
