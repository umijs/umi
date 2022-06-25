import { logger } from '@umijs/utils';

export function printHelp() {
  logger.fatal('A complete log of this run can be found in:');
  logger.fatal(logger.getLatestLogFilePath());
  logger.fatal(
    'Consider reporting a GitHub issue on https://github.com/umijs/umi/issues',
  );
}
