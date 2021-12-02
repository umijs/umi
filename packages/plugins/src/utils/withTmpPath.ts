import { winPath } from '@umijs/utils';
import { join } from 'path';
import { IApi } from 'umi';

export function withTmpPath(opts: {
  api: IApi;
  path: string;
  noPluginDir?: boolean;
}) {
  return winPath(
    join(
      opts.api.paths.absTmpPath,
      opts.api.plugin.key && !opts.noPluginDir
        ? `plugin-${opts.api.plugin.key}`
        : '',
      opts.path,
    ),
  );
}
