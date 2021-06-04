import { isAbsolute, join } from 'path';

export default () => {
  let cwd = process.cwd();
  if (process.env.APP_ROOT) {
    // avoid repeat cwd path
    if (!isAbsolute(process.env.APP_ROOT)) {
      return join(cwd, process.env.APP_ROOT);
    }
    return process.env.APP_ROOT;
  }
  return cwd;
};
