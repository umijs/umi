import { IApi } from '@umijs/types';
import { Bundler as DefaultBundler, ConfigType } from '@umijs/bundler-webpack';
import { join } from 'path';
import { existsSync, readdirSync } from 'fs';
import { rimraf } from '@umijs/utils';

type Env = 'development' | 'production';

export async function getBundleAndConfigs({
  api,
  port,
}: {
  api: IApi;
  port?: number;
}) {
  // bundler
  const Bundler = await api.applyPlugins({
    type: api.ApplyPluginsType.modify,
    key: 'modifyBundler',
    initialValue: DefaultBundler,
  });

  const bundleImplementor = await api.applyPlugins({
    key: 'modifyBundleImplementor',
    type: api.ApplyPluginsType.modify,
    initialValue: undefined,
  });

  // get config
  async function getConfig({ type }: { type: ConfigType }) {
    const env: Env = api.env === 'production' ? 'production' : 'development';
    const getConfigOpts = await api.applyPlugins({
      type: api.ApplyPluginsType.modify,
      key: 'modifyBundleConfigOpts',
      initialValue: {
        env,
        type,
        port,
        hot: type === ConfigType.csr,
        entry: {
          umi: join(api.paths.absTmpPath!, 'umi.ts'),
        },
        // @ts-ignore
        bundleImplementor,
        async modifyBabelOpts(opts: any) {
          return await api.applyPlugins({
            type: api.ApplyPluginsType.modify,
            key: 'modifyBabelOpts',
            initialValue: opts,
            args: {
              env,
            },
          });
        },
        async modifyBabelPresetOpts(opts: any) {
          return await api.applyPlugins({
            type: api.ApplyPluginsType.modify,
            key: 'modifyBabelPresetOpts',
            initialValue: opts,
            args: {
              env,
            },
          });
        },
      },
      args: {
        ...bundlerArgs,
        type,
      },
    });
    return await api.applyPlugins({
      type: api.ApplyPluginsType.modify,
      key: 'modifyBundleConfig',
      initialValue: await bundler.getConfig(getConfigOpts),
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
    key: 'modifyBundleConfigs',
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
    bundleImplementor,
    bundler,
    bundleConfigs,
  };
}

export function cleanTmpPathExceptCache({
  absTmpPath,
}: {
  absTmpPath: string;
}) {
  if (!existsSync(absTmpPath)) return;
  readdirSync(absTmpPath).forEach(file => {
    if (file === `.cache`) return;
    rimraf.sync(join(absTmpPath, file));
  });
}
