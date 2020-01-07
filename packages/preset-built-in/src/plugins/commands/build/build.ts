import { IApi, IConfig } from '@umijs/types';
import { Bundler as DefaultBundler } from '@umijs/bundler-webpack';

export default function(api: IApi) {
  const {
    cwd,
    paths,
    utils: { rimraf },
  } = api;

  api.registerCommand({
    name: 'build',
    fn: async function() {
      rimraf.sync(paths.absTmpPath!);

      // generate files
      await api.applyPlugins({
        key: 'onGenerateFiles',
        type: api.ApplyPluginsType.event,
      });

      // bundler
      const Bundler = await api.applyPlugins({
        type: api.ApplyPluginsType.modify,
        key: 'modifyBundler',
        initialValue: DefaultBundler,
      });

      // get config
      async function getConfig({ type }: { type: string }) {
        return await api.applyPlugins({
          type: api.ApplyPluginsType.modify,
          key: 'modifyBundleConfig',
          initialValue: bundler.getConfig({
            // @ts-ignore
            env: api.env === 'production' ? 'production' : 'development',
            type,
          }),
          args: {
            ...bundlerArgs,
            type,
          },
        });
      }
      const bundler: DefaultBundler = new Bundler({
        cwd,
        config: api.config,
      });
      const bundlerArgs = {
        env: api.env,
        bundler: { id: Bundler.id },
      };
      const bundleConfigs = await api.applyPlugins({
        type: api.ApplyPluginsType.modify,
        key: 'modifyBundlerConfigs',
        initialValue: [
          await getConfig({ type: 'umi-csr' }),
          api.config!.ssr && (await getConfig({ type: 'umi-ssr' })),
        ].filter(Boolean),
        args: {
          ...bundlerArgs,
          getConfig,
        },
      });

      // build
      const { stats } = await bundler.build({
        bundleConfigs,
      });
      console.log(stats);
    },
  });
}
