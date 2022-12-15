import { createHash } from 'crypto';
import { readdirSync, readFileSync, statSync, existsSync } from 'fs';
import { join } from 'path';

// TODO support detect monorepo patches、yarn v2+
export function getPatchesHash(basedir: string) {
  const patchesDir = join(basedir, 'patches');
  const patchesHash: Record<string, string> = {};

  if (existsSync(patchesDir) && statSync(patchesDir).isDirectory()) {
    const patchNames = readdirSync(patchesDir, { withFileTypes: true })
      .filter(
        (dirEntry) => dirEntry.isFile() && dirEntry.name.endsWith('.patch'),
      )
      .map((dirEntry) => dirEntry.name);

    patchNames.forEach((name) => {
      const content = readFileSync(join(patchesDir, name), 'utf-8');
      patchesHash[name] = createHash('sha256')
        .update(content)
        .digest('hex')
        .substring(0, 8);
    });
  }

  return patchesHash;
}
