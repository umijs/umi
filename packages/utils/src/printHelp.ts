import * as logger from './logger';

// TODO: 先注释，因为这里要考虑比如 @alipay/bigfish 不应该走这个提示
// const FEEDBACK_MESSAGE = '如果你需要进交流群，请访问 https://fb.umijs.org';

export function exit() {
  const loggerPath = logger.getLatestLogFilePath();
  if (loggerPath) {
    logger.fatal('A complete log of this run can be found in:');
    logger.fatal(loggerPath);
  }
  logger.fatal(
    'Consider reporting a GitHub issue on https://github.com/umijs/umi/issues',
  );
  // logger.fatal(FEEDBACK_MESSAGE);
}

export function runtime(e: Error) {
  logger.error(e);
  // logger.fatal(FEEDBACK_MESSAGE);
}
