import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

export function getPkgs(): string[] {
  return readdirSync(join(__dirname, '../packages')).filter((dir) => {
    return (
      !dir.startsWith('.') &&
      existsSync(join(__dirname, '../packages', dir, 'package.json'))
    );
  });
}
