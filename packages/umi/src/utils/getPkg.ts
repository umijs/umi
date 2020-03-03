import { join } from 'path';

export default (dir: string) => {
  try {
    return require(join(dir, 'package.json'));
  } catch (error) {
    return null;
  }
};
