import { join } from 'path';
import { existsSync } from 'fs';

const configFiles = ['.umirc.js', '.umirc.ts', 'config/config.js', 'config/config.ts'];

export function getConfigFile(targetDir) {
  for (const f of configFiles) {
    const af = join(targetDir, f);
    if (existsSync(af)) {
      return af;
    }
  }
}

export function isUmiProject(targetDir) {
  const configFile = getConfigFile(targetDir);
  if (configFile) return true;

  function existFile(f) {
    return existsSync(join(targetDir, f));
  }

  if (existFile('src') || existFile('pages') || existFile('page')) {
    return true;
  }
}

export function isDepLost(e) {
  const m = e.message.match(/Cannot find module '(.+)'/);
  return m && !m[1].startsWith('.');
}

export function isPluginLost(e) {
  return e.message.match(/Plugin .+? can't be resolved/);
}
