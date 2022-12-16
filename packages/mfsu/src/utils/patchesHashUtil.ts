import { lodash } from '@umijs/utils';
import { createHash } from 'crypto';
import { readdirSync, readFileSync, statSync, existsSync } from 'fs';
import { join } from 'path';

const getPatchFiles = (basedir: string) => {
  const patchesDir = join(basedir, 'patches');
  let files: string[] = [];

  if (existsSync(patchesDir) && statSync(patchesDir).isDirectory()) {
    files = readdirSync(patchesDir, { withFileTypes: true })
      .filter((dir) => dir.isFile() && dir.name.endsWith('.patch'))
      .map((dir) => join(patchesDir, dir.name));
  }

  return files;
};

// TODO support detect monorepo patches、yarn v2+
export function getPatchesHash(basedir: string, files?: string[]) {
  const map: Record<string, string> = {};
  const patchFiles = files || getPatchFiles(basedir);

  patchFiles.forEach((file) => {
    const content = readFileSync(file, 'utf8');
    map[file] = createHash('sha256')
      .update(content)
      .digest('hex')
      .substring(0, 8);
  });

  return map;
}

export const isPatchesChanged = (opts: {
  basedir: string;
  prevHashMap: Record<string, string>;
}) => {
  // keep default prevHashMap strict equal with `getPatchesHash()` in non-patches case.
  const { prevHashMap = {}, basedir } = opts;
  const patchFiles = getPatchFiles(basedir);

  if (Object.keys(prevHashMap).length !== patchFiles.length) {
    return false;
  }

  return lodash.isEqual(prevHashMap, getPatchesHash(basedir, patchFiles));
};
