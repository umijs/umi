import rimraf from 'rimraf';
import ora from 'ora';

import { makeSureMaterialsTempPathExist } from './download';

export function clearGitCache(args) {
  const spinner = ora();
  const blocksTempPath = makeSureMaterialsTempPathExist(args.dryRun);

  spinner.start(`start clear：${blocksTempPath}`);
  rimraf(blocksTempPath, error => {
    if (error) {
      console.log(error);
      spinner.stop();
      return;
    }
    spinner.succeed();
  });
}
