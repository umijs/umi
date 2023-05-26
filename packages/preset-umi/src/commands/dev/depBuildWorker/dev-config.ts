import { lodash } from '@umijs/utils';
import { join } from 'path';
import { IApi } from '../../../types';
import { getBabelOpts } from '../getBabelOpts';

const MFSU_EAGER_DEFAULT_INCLUDE = [
  'react',
  'react-error-overlay',
  'react/jsx-dev-runtime',
  '@umijs/utils/compiled/strip-ansi',
];

export default (api: IApi) => {
  api.describe({
    enableBy() {
      return api.name === 'dev-config';
    },
    key: 'dev-config',
  });

  api.registerCommand({
    name: 'dev-config',
    description: 'dev server for development',
    details: ``,
    async fn() {
      const {
        babelPreset,
        beforeBabelPlugins,
        beforeBabelPresets,
        extraBabelPlugins,
        extraBabelPresets,
      } = await getBabelOpts({ api });

      const chainWebpack = async (memo: any, args: Object) => {
        await api.applyPlugins({
          key: 'chainWebpack',
          type: api.ApplyPluginsType.modify,
          initialValue: memo,
          args,
        });
      };
      const modifyWebpackConfig = async (memo: any, args: Object) => {
        return await api.applyPlugins({
          key: 'modifyWebpackConfig',
          initialValue: memo,
          args,
        });
      };

      const entry = await api.applyPlugins({
        key: 'modifyEntry',
        initialValue: {
          umi: join(api.paths.absTmpPath, 'umi.ts'),
        },
      });
      const opts: any = {
        config: { ...api.config, forkTSChecker: false },
        pkg: api.pkg,
        cwd: api.cwd,
        rootDir: process.cwd(),
        entry,
        port: api.appData.port,
        host: api.appData.host,
        ip: api.appData.ip,
        ...{ babelPreset, chainWebpack, modifyWebpackConfig },
        beforeBabelPlugins,
        beforeBabelPresets,
        extraBabelPlugins,
        extraBabelPresets,
        // vite 模式使用 ./plugins/ViteHtmlPlugin.ts 处理
        mfsuWithESBuild: api.config.mfsu?.esbuild,
        mfsuStrategy: api.config.mfsu?.strategy,
        cache: {
          buildDependencies: [
            api.pkgPath,
            api.service.configManager!.mainConfigFile || '',
          ].filter(Boolean),
        },
        mfsuInclude: lodash.union([
          ...MFSU_EAGER_DEFAULT_INCLUDE,
          ...(api.config.mfsu?.include || []),
        ]),
      };

      return opts;
    },
  });
};
