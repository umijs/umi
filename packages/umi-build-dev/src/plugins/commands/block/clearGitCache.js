import rimraf from 'rimraf';
import ora from 'ora';
import chalk from 'chalk';

import { makeSureMaterialsTempPathExist } from './download';

/**
 * 清理 git 缓存目录
 * @param {*} args
 * @param {*} log
 */
export default function clearGitCache(args, { log, uiLog }) {
  const spinner = ora();
  const blocksTempPath = makeSureMaterialsTempPathExist(args.dryRun);

  const info = `🗑  start clear: ${chalk.yellow(blocksTempPath)}`;
  spinner.start(info);

  // umi ui 的日志
  if (uiLog) {
    uiLog('info', info);
  }

  rimraf(blocksTempPath, error => {
    if (error) {
      log.error(error);
      spinner.stop();
      return;
    }
    spinner.succeed();
  });
}
