import { join } from 'path';
import { IApi } from 'umi';
import { winPath } from 'umi/plugin-utils';

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

export function isUtooWin(api: IApi) {
  return process.platform === 'win32' && api.appData.bundler === 'utoopack';
}

export function getPluginModelImport(api: IApi) {
  return isUtooWin(api) ? '../plugin-model' : '@@/plugin-model';
}
