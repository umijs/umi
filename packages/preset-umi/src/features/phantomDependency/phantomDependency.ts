import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    key: 'phantomDependency',
    config: {
      schema(Joi) {
        return Joi.object({
          exclude: Joi.array().items(Joi.string()),
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

  api.onCheckCode((opts) => {
    if (opts.isFromTmp) return;
    if (/node_modules/.test(opts.file)) return;
    opts.imports.forEach((imp) => {
      const { source, loc } = imp;
      if (source.startsWith('.')) return;
      if (source.startsWith('/')) return;
      if (source.startsWith('@/') || source.startsWith('@@/')) return;

      if (api.config.phantomDependency.exclude?.includes(source)) return;

      const pkgName = getPkgName(source);
      if (api.pkg.dependencies?.[pkgName]) return;
      if (api.pkg.devDependencies?.[pkgName]) return;
      // clientDependencies is used in tnpm
      if (api.pkg.clientDependencies?.[pkgName]) return;

      if (matchAlias(source, api.config.alias || {})) return;
      if (matchExternals(source, api.config.externals || {})) return;

      throw new opts.CodeFrameError(
        `${source} is a phantom dependency, please specify it in package.json.`,
        loc,
      );
    });
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
