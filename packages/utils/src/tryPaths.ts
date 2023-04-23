import { existsSync } from 'fs';

export function tryPaths(paths: string[]) {
  for (const path of paths) {
    if (existsSync(path)) return path;
  }
}
