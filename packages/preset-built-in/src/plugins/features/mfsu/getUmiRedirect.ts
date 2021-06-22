import { init, parse } from 'es-module-lexer';
import { readFileSync } from 'fs';
import { join } from 'path';
import { runtimePath } from '../../generateFiles/constants';

export async function getUmiRedirect(umiDir: string) {
  const distFile = join(umiDir, 'dist/index.esm.js');
  const content = readFileSync(distFile, 'utf-8');

  await init;
  const [_, exports] = parse(content);
  return exports.reduce((memo, key) => {
    memo[key] = runtimePath;
    return memo;
  }, {});
}
