import * as logger from './logger';

const FEEDBACK_MESSAGE = '如果你需要进交流群，请访问 https://fb.umijs.org 。';

export function exit() {
  const loggerPath = logger.getLatestLogFilePath();
  if (loggerPath) {
    logger.fatal('A complete log of this run can be found in:');
    logger.fatal(loggerPath);
  }
  logger.fatal(
    'Consider reporting a GitHub issue on https://github.com/umijs/umi/issues',
  );
  const binFile = process.argv[1];
  const isUmi = binFile.endsWith('bin/umi.js');
  const isMax = binFile.endsWith('bin/max.js');
  if (process.env.FATAL_GUIDE_MESSAGE !== 'none' && (isUmi || isMax)) {
    logger.fatal(FEEDBACK_MESSAGE);
  }
  if (
    process.env.FATAL_GUIDE_MESSAGE &&
    process.env.FATAL_GUIDE_MESSAGE !== 'none'
  ) {
    logger.fatal(process.env.FATAL_GUIDE_MESSAGE);
  }
}

export function runtime(e: Error) {
  logger.error(e);
  // logger.fatal(FEEDBACK_MESSAGE);
}
