import { createHash } from 'crypto';
import path from 'path';
import fs from 'fs';

const AGENTS = ['pnpm-lock.yaml', 'yarn.lock', 'package-lock.json'];

export function getDepHash(basedir: string) {
  let content = lookupLockfile(basedir);

  return createHash('sha256').update(content).digest('hex').substring(0, 8);
}

// `rootPath` is only use for unit test to stop lookup lock file.
export function lookupLockfile(basedir: string, rootPath?: string): string {
  for (let lockfile of AGENTS) {
    const fullPath = path.join(basedir, lockfile);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return fs.readFileSync(fullPath, 'utf-8');
    }
  }

  const parentDir = path.dirname(basedir);
  if (parentDir !== basedir && (!rootPath || parentDir.startsWith(rootPath))) {
    return lookupLockfile(parentDir, rootPath);
  }

  return '';
}
