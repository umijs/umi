import { join } from 'path';

export default () => {
  let cwd = process.cwd();
  if (process.env.APP_ROOT) {
    cwd = join(cwd, process.env.APP_ROOT);
  }
  return cwd;
};
