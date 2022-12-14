import { createHash } from 'crypto';
import { existsSync, statSync, readFileSync } from 'fs-extra';
import { dirname, basename, join } from 'path';

const lockfileFormats = [
  { name: 'pnpm-lock.yaml', checkPatches: false },
  { name: 'package-lock.json', checkPatches: true },
  { name: 'yarn.lock', checkPatches: true },
];

export function getDepHash(basedir: string) {
  const names = lockfileFormats.map((format) => format.name);

  // TS can't infer return type in this situation.
  const lookup = (basedir: string): string | false => {
    for (let lockfile of names) {
      const fullPath = join(basedir, lockfile);
      if (existsSync(fullPath) && statSync(fullPath).isFile()) {
        return fullPath;
      }
    }

    const parentDir = dirname(basedir);
    if (parentDir !== basedir) {
      return lookup(parentDir);
    }

    return false;
  };

  const lockfilePath = lookup(basedir);
  let content = '';

  if (lockfilePath) {
    content += readFileSync(lockfilePath, 'utf-8');
    const lockfileName = basename(lockfilePath);
    const { checkPatches } = lockfileFormats.find(
      ({ name }) => name === lockfileName,
    )!;

    if (checkPatches) {
      const fullPath = join(dirname(lockfilePath), 'patches');
      if (existsSync(fullPath)) {
        const stats = statSync(fullPath);
        if (stats.isDirectory()) {
          content += stats.mtimeMs.toString();
        }
      }
    }
  }

  return createHash('sha256').update(content).digest('hex').substring(0, 8);
}
