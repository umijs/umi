import { join } from 'path';
import { existsSync } from 'fs';

export default function(cwd, moduleId) {
  return existsSync(join(cwd, 'node_modules', moduleId));
}
