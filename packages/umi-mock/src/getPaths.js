import { join } from 'path';

export default function(cwd) {
  const absMockPath = join(cwd, 'mock');
  const absConfigPath = join(cwd, '.umirc.mock.js');
  const absConfigPathWithTS = join(cwd, '.umirc.mock.ts');
  return {
    absMockPath,
    absConfigPath,
    absConfigPathWithTS,
  };
}
