import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

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

export function isUsingBigfish(targetDir) {
  const pkgPath = join(targetDir, 'package.json');
  if (!existsSync(pkgPath)) return false;
  const pkgStr = readFileSync(pkgPath, 'utf-8');
  return pkgStr.includes('"@alipay/bigfish"');
}

export function isUsingUmi(targetDir) {
  const pkgPath = join(targetDir, 'package.json');
  if (!existsSync(pkgPath)) return false;
  const pkgStr = readFileSync(pkgPath, 'utf-8');
  return pkgStr.includes('"umi"') && !isUsingBigfish(targetDir);
}

export function isDepLost(e) {
  const m = e.message.match(/Cannot find module '(.+)'/);
  return m && !m[1].startsWith('.');
}

export function isPluginLost(e) {
  return e.message.match(/Plugin .+? can't be resolved/);
}
