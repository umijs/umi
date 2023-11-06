import { chalk, logger, winPath } from '@umijs/utils';
import path from 'path';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    key: 'phantomDependency',
    config: {
      schema({ zod }) {
        return zod.object({
          exclude: zod.array(zod.string()).optional(),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.onStart(() => {
    if (api.appData.npmClient === 'pnpm') {
      api.logger.warn('Phantom dependencies check is not needed in pnpm.');
    }
  });

  api.onPrepareBuildSuccess(({ result }) => {
    const files = Object.keys(result.metafile!.inputs);
    const importsBySource = new Map();
    for (const file of files) {
      const winP = winPath(file);
      if (winP.includes('.umi/')) continue;
      if (winP.includes('/node_modules/')) continue;
      if (winP.startsWith('../')) continue;
      if (path.isAbsolute(file)) continue;
      const { imports } = result.metafile!.inputs[file];
      for (const imp of imports) {
        // external means it's not in project src
        if (imp.kind === 'import-statement' && imp.external) {
          if (!importsBySource.has(imp.path)) {
            importsBySource.set(imp.path, []);
          }
          importsBySource.get(imp.path).push({ file });
        }
      }
    }
    const phantomDeps = [];
    for (const [source, files] of importsBySource) {
      // <runtime> is a special source,
      // it might be from esbuild internal
      if (source.startsWith('<')) continue;
      if (source.startsWith('.')) continue;
      if (source.startsWith('/')) continue;
      if (source.startsWith('@/') || source.startsWith('@@/')) continue;

      const pkgName = getPkgName(source);
      if (api.config.phantomDependency.exclude?.includes(pkgName)) continue;

      if (api.pkg.dependencies?.[pkgName]) continue;
      if (api.pkg.devDependencies?.[pkgName]) continue;
      // clientDependencies is used in ant-fin internal
      if (api.pkg.clientDependencies?.[pkgName]) continue;

      if (matchAlias(source, api.config.alias || {})) continue;
      if (matchExternals(source, api.config.externals || {})) continue;

      phantomDeps.push(source);
      logger.error(
        `[phantomDependency] ${chalk.red(
          `${source} is a phantom dependency, please specify it in package.json.`,
        )}`,
      );
      for (const file of files) {
        logger.error(`[phantomDependency] ${file.file} imports ${source}`);
      }
    }
    if (phantomDeps.length && api.name !== 'dev') {
      throw new Error(
        `[phantomDependency] has phantom dependencies ${phantomDeps.join(
          ', ',
        )}, exit.`,
      );
    }
  });

  function getPkgName(source: string) {
    const arr = source.split('/');
    if (source.startsWith('@')) return arr[0] + '/' + arr[1];
    return arr[0];
  }

  function matchAlias(source: string, alias: Record<string, string>) {
    const keys = Object.keys(alias);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const keyWithSlashAffix = key.endsWith('/') ? key : `${key}/`;
      if (key.endsWith('$') && source === key.slice(0, -1)) {
        return true;
      } else if (source === key || source.startsWith(keyWithSlashAffix)) {
        return true;
      }
    }
    return false;
  }

  function matchExternals(source: string, externals: Record<string, string>) {
    const keys = Object.keys(externals);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (source === key) {
        return true;
      }
    }
    return false;
  }
};
