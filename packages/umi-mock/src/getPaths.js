import { join } from 'path';
import { winPath } from 'umi-utils';

export default function(cwd) {
  const winCwd = winPath(cwd);
  const absMockPath = winPath(join(winCwd, 'mock'));
  const absConfigPath = winPath(join(winCwd, '.umirc.mock.js'));
  const absConfigPathWithTS = winPath(join(winCwd, '.umirc.mock.ts'));
  return {
    absMockPath,
    absConfigPath,
    absConfigPathWithTS,
  };
}
