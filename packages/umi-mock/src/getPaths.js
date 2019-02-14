import { join } from 'path';

export default function(cwd) {
  const absMockPath = join(cwd, 'mock');
  const absConfigPath = join(cwd, '.umirc.mock.js');
  return {
    absMockPath,
    absConfigPath,
  };
}
