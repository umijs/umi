import rimraf from 'rimraf';
import ora from 'ora';

import { makeSureMaterialsTempPathExist } from './download';

/**
 * 清理 git 缓存目录
 * @param {*} args
 * @param {*} log
 */
export default function clearGitCache(args, { log }) {
  const spinner = ora();
  const blocksTempPath = makeSureMaterialsTempPathExist(args.dryRun);

  spinner.start(`🗑  start clear: ${blocksTempPath}`);
  rimraf(blocksTempPath, error => {
    if (error) {
      log.error(error);
      spinner.stop();
      return;
    }
    spinner.succeed();
  });
}
