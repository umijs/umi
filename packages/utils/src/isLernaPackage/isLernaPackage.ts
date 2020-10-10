import { existsSync } from 'fs';
import { join } from 'path';

export default function (root: string) {
  return existsSync(join(root, 'lerna.json'));
}
