import { execaSync } from '@umijs/utils/compiled/execa';

export function checkGitRepo(cwd: string): boolean {
  try {
    execaSync('git', ['--no-pager', 'log'], { cwd });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export default checkGitRepo;
