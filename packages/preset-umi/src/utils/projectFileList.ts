import { resolve as resolvePath } from 'path';
import { IApi } from '../types';

export function getProjectFileListPromise(api: IApi): Promise<string[]> {
  return new Promise<string[]>((resolve) => {
    api.onPrepareBuildSuccess(({ result, isWatch }) => {
      if (!isWatch) {
        const files = Object.keys(result.metafile!.inputs)
          .sort()
          .map((f) => resolvePath(api.paths.cwd, f))
          .filter((f) => f.startsWith(api.paths.absSrcPath));

        resolve(files);
      }
    });
  });
}
