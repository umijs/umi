import { readdirSync } from 'fs';
import { join } from 'path';

// a/b/c/* => a/b/c/x,a/b/c/y ,a/b/c/z
export const getFuzzyIncludes = (include: string) => {
  const includeDeepArray = include.split('/');
  const resolvePath = join(
    process.cwd(),
    'node_modules',
    includeDeepArray.slice(0, includeDeepArray.length - 1).join('/'),
  );
  const dir = readdirSync(resolvePath);
  const includes = dir
    .map((fileName) => {
      if (fileName.endsWith('.d.ts')) {
        return;
      }
      return includeDeepArray
        .slice(0, includeDeepArray.length - 1)
        .concat(fileName.split('.')[0])
        .join('/');
    })
    .filter(Boolean);
  return includes;
};
