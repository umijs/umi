import { join, isAbsolute } from 'path';

export default (dir: string) => {
  try {
    if (process.env.APP_ROOT) {
      // avoid repeat cwd path
      if (!isAbsolute(process.env.APP_ROOT)) {
        return require(join(
          process.cwd(),
          process.env.APP_ROOT,
          'package.json',
        ));
      }
      return require(join(process.env.APP_ROOT, 'package.json'));
    }
    return require(join(dir, 'package.json'));
  } catch (error) {
    try {
      return require(join(dir, 'package.json'));
    } catch (error) {
      return null;
    }
  }
};
