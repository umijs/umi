import { winPath } from '@umijs/utils';
import { normalize, resolve as resolvePath } from 'path';
import { IApi } from '../types';

export function getProjectFileListPromise(api: IApi): Promise<string[]> {
  return new Promise<string[]>((resolve) => {
    api.onPrepareBuildSuccess(({ result, isWatch }) => {
      if (!isWatch) {
        const srcPath = winPath(normalize(api.paths.absSrcPath));

        const files = Object.keys(result.metafile!.inputs)
          .map((f) => winPath(resolvePath(api.paths.cwd, f)))
          .filter((f) => f.startsWith(srcPath));

        resolve(files);
      }
    });
  });
}
