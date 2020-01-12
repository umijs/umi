import { IApi } from '@umijs/types';
import { Bundler as DefaultBundler, ConfigType } from '@umijs/bundler-webpack';
import getBundleAndConfigs from '../getBundleAndConfigs';

export default function(api: IApi) {
  const {
    cwd,
    paths,
    utils: { rimraf, chalk },
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

      // build
      const { bundler, bundleConfigs } = await getBundleAndConfigs({ api });
      try {
        const { stats } = await bundler.build({
          bundleConfigs,
        });
        console.log(chalk.green(`Build success.`));
        // console.log(stats);
      } catch (e) {}
    },
  });
}
