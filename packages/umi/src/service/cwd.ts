import { isAbsolute, join } from 'path';

export function getCwd() {
  const cwd = process.cwd();
  const appRoot = process.env.APP_ROOT;
  if (appRoot) {
    return isAbsolute(appRoot) ? appRoot : join(cwd, appRoot);
  }
  return cwd;
}
