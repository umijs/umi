import resolve from 'resolve';
import { dirname } from 'path';
// @ts-ignore
import crequire from 'crequire';
import { readFileSync } from 'fs';
import winPath from '../winPath/winPath';

function parse(filePath: string): string[] {
  const content = readFileSync(filePath, 'utf-8');
  return crequire(content)
    .map((o: any) => o.path)
    .filter((path: string) => path.charAt(0) === '.')
    .map((path: string) =>
      winPath(
        resolve.sync(path, {
          basedir: dirname(filePath),
          extensions: ['.tsx', '.ts', '.jsx', '.js'],
        }),
      ),
    );
}

export default function(filePath: string) {
  const paths = [filePath];
  const ret = [filePath];

  while (paths.length) {
    const extraPaths = parse(paths.shift()!);
    if (extraPaths.length) {
      paths.push(...extraPaths);
      ret.push(...extraPaths);
    }
  }

  return ret;
}
