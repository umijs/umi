import { resolve } from 'path';
import { IApi } from '../types';

export function getProjectFileListPromise(api: IApi): Promise<string[]> {
  return new Promise<string[]>((rslv) => {
    api.onPrepareBuildSuccess(({ result, isWatch }) => {
      if (!isWatch) {
        const files = Object.keys(result.metafile!.inputs)
          .sort()
          .map((f) => resolve(api.paths.cwd, f))
          .filter((f) => f.startsWith(api.paths.absSrcPath));

        rslv(files);
      }
    });
  });
}
