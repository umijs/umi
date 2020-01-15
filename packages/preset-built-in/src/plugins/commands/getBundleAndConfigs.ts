import { IApi, IConfig } from '@umijs/types';
import { Bundler as DefaultBundler, ConfigType } from '@umijs/bundler-webpack';
import { join } from 'path';

export default async ({ api }: { api: IApi }) => {
  // bundler
  const Bundler = await api.applyPlugins({
    type: api.ApplyPluginsType.modify,
    key: 'modifyBundler',
    initialValue: DefaultBundler,
  });

  // get config
  async function getConfig({ type }: { type: ConfigType }) {
    const tmpDir =
      api.env === 'development' ? '.umi' : `.umi-${process.env.NODE_ENV}`;

    const env = api.env === 'production' ? 'production' : 'development';
    return await api.applyPlugins({
      type: api.ApplyPluginsType.modify,
      key: 'modifyBundleConfig',
      initialValue: bundler.getConfig({
        env,
        type,
        hot: type === ConfigType.csr,
        entry: {
          umi: join(api.cwd, tmpDir, 'umi.ts'),
        },
      }),
      args: {
        ...bundlerArgs,
        type,
      },
    });
  }
  const bundler: DefaultBundler = new Bundler({
    cwd: api.cwd,
    config: api.config,
  });
  const bundlerArgs = {
    env: api.env,
    bundler: { id: Bundler.id, version: Bundler.version },
  };
  const bundleConfigs = await api.applyPlugins({
    type: api.ApplyPluginsType.modify,
    key: 'modifyBundlerConfigs',
    initialValue: [
      await getConfig({ type: ConfigType.csr }),
      api.config!.ssr && (await getConfig({ type: ConfigType.ssr })),
    ].filter(Boolean),
    args: {
      ...bundlerArgs,
      getConfig,
    },
  });

  return {
    bundler,
    bundleConfigs,
  };
};
