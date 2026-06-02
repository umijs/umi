import { dirname, join, relative } from 'path';
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

function withTmpPluginPath(opts: { api: IApi; pluginKey: string }) {
  return winPath(join(opts.api.paths.absTmpPath, `plugin-${opts.pluginKey}`));
}

export function isUtooWin(api: IApi) {
  return process.platform === 'win32' && api.appData.bundler === 'utoopack';
}

export function getPluginModelImport(opts: { api: IApi; from: string }) {
  if (!isUtooWin(opts.api)) {
    return '@@/plugin-model';
  }

  const from = withTmpPath({ api: opts.api, path: opts.from });
  const to = withTmpPluginPath({ api: opts.api, pluginKey: 'model' });
  const relPath = winPath(relative(dirname(from), to));

  return relPath.startsWith('.') ? relPath : `./${relPath}`;
}
