import { IApi } from '@umijs/types';
import { existsSync } from 'fs';
import { Logger } from '@umijs/core';
import { cleanTmpPathExceptCache, getBundleAndConfigs } from '../buildDevUtils';
import generateFiles from '../generateFiles';

const logger = new Logger('umi:preset-build-in');

export default function(api: IApi) {
  const {
    paths,
    utils: { rimraf, chalk },
  } = api;

  api.registerCommand({
    name: 'build',
    fn: async function() {
      cleanTmpPathExceptCache({
        absTmpPath: paths.absTmpPath!,
      });

      // generate files
      await generateFiles({ api, watch: false });

      // build
      const {
        bundler,
        bundleConfigs,
        bundleImplementor,
      } = await getBundleAndConfigs({ api });
      try {
        // clear output path before exec build
        if (process.env.CLEAR_OUTPUT !== 'none') {
          if (paths.absOutputPath && existsSync(paths.absOutputPath || '')) {
            logger.debug(`Clear OutputPath: ${paths.absNodeModulesPath}`);
            rimraf.sync(paths.absOutputPath);
          }
        }

        const { stats } = await bundler.build({
          bundleConfigs,
          bundleImplementor,
        });
        if (process.env.RM_TMPDIR !== 'none') {
          rimraf.sync(paths.absTmpPath!);
        }
        console.log(chalk.green(`Build success.`));
        await api.applyPlugins({
          key: 'onBuildComplete',
          type: api.ApplyPluginsType.event,
          args: {
            stats,
          },
        });
      } catch (err) {
        await api.applyPlugins({
          key: 'onBuildComplete',
          type: api.ApplyPluginsType.event,
          args: {
            err,
          },
        });
      }
    },
  });
}
