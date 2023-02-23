import { winPath } from '@umijs/utils';
import { normalize, resolve as resolvePath } from 'path';
import { IApi } from '../types';

export function getProjectFileListPromise(api: IApi): Promise<string[]> {
  return new Promise<string[]>((resolve) => {
    api.onPrepareBuildSuccess(({ result, isWatch }) => {
      if (!isWatch) {
        const debugfs = Object.keys(result.metafile!.inputs).sort();
        const srcPath = winPath(normalize(api.paths.absSrcPath));

        console.log(
          '------ Object.keys(result.metafile!.inputs) ->',
          Object.keys(result.metafile!.inputs),
        );

        console.log(
          'resolved',
          debugfs.map((f) => winPath(resolvePath(api.paths.cwd, f))),
        );
        console.log('------ api.paths.cwd ->', api.paths.cwd, srcPath);

        const files = Object.keys(result.metafile!.inputs)
          .map((f) => winPath(resolvePath(api.paths.cwd, f)))
          .filter((f) => f.startsWith(srcPath));

        resolve(files);
      }
    });
  });
}
