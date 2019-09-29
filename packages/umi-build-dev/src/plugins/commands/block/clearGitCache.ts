import rimraf from 'rimraf';
import ora from 'ora';
import chalk from 'chalk';

import { makeSureMaterialsTempPathExist } from './download';

/**
 * 清理 git 缓存目录
 * @param args
 * @param param1
 */
export default function clearGitCache(args: { dryRun?: boolean }, { log }: { log?: any }) {
  const spinner = ora();
  const blocksTempPath = makeSureMaterialsTempPathExist(args.dryRun);

  const info = `🗑  start clear: ${chalk.yellow(blocksTempPath)}`;
  spinner.start(info);

  try {
    rimraf.sync(blocksTempPath);
    spinner.succeed();
  } catch (error) {
    log.error(error);
    spinner.stop();
  }

  return `🗑  start clear: ${blocksTempPath}`;
}
