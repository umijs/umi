import * as logger from './logger';

const FEEDBACK_MESSAGE = '如果你需要进交流群，请访问 https://fb.umijs.org';

export function exit() {
  logger.fatal('A complete log of this run can be found in:');
  logger.fatal(logger.getLatestLogFilePath());
  logger.fatal(
    'Consider reporting a GitHub issue on https://github.com/umijs/umi/issues',
  );
  logger.fatal(FEEDBACK_MESSAGE);
}

export function runtime(e: Error) {
  logger.error(e);
  logger.fatal(FEEDBACK_MESSAGE);
}
