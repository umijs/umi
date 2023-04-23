import { winPath } from '@umijs/utils';
import { normalize, resolve as resolvePath } from 'path';
import { IApi } from '../types';

export function getProjectFileList(api: IApi): string[] {
  const result = api.appData.prepare!.buildResult;
  const srcPath = winPath(normalize(api.paths.absSrcPath));

  return Object.keys(result.metafile!.inputs)
    .map((f) => winPath(resolvePath(api.paths.cwd, f)))
    .filter((f) => f.startsWith(srcPath));
}
