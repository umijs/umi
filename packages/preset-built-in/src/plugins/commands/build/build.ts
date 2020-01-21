import { IApi } from '@umijs/types';
import getBundleAndConfigs from '../getBundleAndConfigs';
import generateFiles from '../generateFiles';

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
      await generateFiles({ api, watch: false });

      // build
      const {
        bundler,
        bundleConfigs,
        bundleImplementor,
      } = await getBundleAndConfigs({ api });
      try {
        const { stats } = await bundler.build({
          bundleConfigs,
          bundleImplementor,
        });
        rimraf.sync(paths.absTmpPath!);
        console.log(chalk.green(`Build success.`));
        // console.log(stats);
      } catch (e) {}
    },
  });
}
