import { winPath } from '@umijs/utils';
import { resolve as resolvePath } from 'path';
import { IApi } from '../types';

export function getProjectFileListPromise(api: IApi): Promise<string[]> {
  return new Promise<string[]>((resolve) => {
    api.onPrepareBuildSuccess(({ result, isWatch }) => {
      if (!isWatch) {
        const debugfs = Object.keys(result.metafile!.inputs);

        console.log(
          '------ Object.keys(result.metafile!.inputs) ->',
          Object.keys(result.metafile!.inputs),
        );

        console.log(
          'resolved',
          debugfs.map((f) => winPath(resolvePath(api.paths.cwd, f))),
        );
        console.log(
          '------ api.paths.cwd ->',
          api.paths.cwd,
          api.paths.absSrcPath,
        );

        const files = Object.keys(result.metafile!.inputs)
          .map((f) => winPath(resolvePath(api.paths.cwd, f)))
          .filter((f) => f.startsWith(api.paths.absSrcPath));

        resolve(files);
      }
    });
  });
}
